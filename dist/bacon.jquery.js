(function() {
  var $, Bacon, init,
    __slice = [].slice;

  init = function(Bacon, $) {
    var Lens, Model, defaultEquals, fold, globalModCount, id, idCounter, isModel, nonEmpty, sameValue, shallowCopy, valueLens;
    id = function(x) {
      return x;
    };
    nonEmpty = function(x) {
      return x.length > 0;
    };
    fold = function(xs, seed, f) {
      var x, _i, _len;
      for (_i = 0, _len = xs.length; _i < _len; _i++) {
        x = xs[_i];
        seed = f(seed, x);
      }
      return seed;
    };
    isModel = function(obj) {
      return obj instanceof Bacon.Property;
    };
    globalModCount = 0;
    idCounter = 1;
    defaultEquals = function(a, b) {
      return a === b;
    };
    sameValue = function(eq) {
      return function(a, b) {
        return !a.initial && eq(a.value, b.value);
      };
    };
    Model = Bacon.Model = Bacon.$.Model = function(initValue) {
      var currentValue, eq, model, modificationBus, myId, myModCount, syncBus, valueWithSource;
      myId = idCounter++;
      eq = defaultEquals;
      myModCount = 0;
      modificationBus = new Bacon.Bus();
      syncBus = new Bacon.Bus();
      currentValue = void 0;
      valueWithSource = Bacon.update({
        initial: true
      }, [modificationBus], (function(_arg, _arg1) {
        var changed, f, modStack, newValue, source, value;
        value = _arg.value;
        source = _arg1.source, f = _arg1.f;
        newValue = f(value);
        modStack = [myId];
        changed = newValue !== value;
        return {
          source: source,
          value: newValue,
          modStack: modStack,
          changed: changed
        };
      }), [syncBus], (function(_, syncEvent) {
        return syncEvent;
      })).skipDuplicates(sameValue(eq)).changes().toProperty();
      model = valueWithSource.map(".value").skipDuplicates(eq);
      model.onValue(function(x) {
        return currentValue = x;
      });
      model.id = myId;
      model.addSyncSource = function(syncEvents) {
        return syncBus.plug(syncEvents.filter(function(e) {
          return e.changed && !Bacon._.contains(e.modStack, myId);
        }).doAction(function() {
          return Bacon.Model.syncCount++;
        }).map(function(e) {
          return shallowCopy(e, "modStack", e.modStack.concat([myId]));
        }).map(function(e) {
          return valueLens.set(e, model.syncConverter(valueLens.get(e)));
        }));
      };
      model.apply = function(source) {
        modificationBus.plug(source.toEventStream().map(function(f) {
          return {
            source: source,
            f: f
          };
        }));
        return valueWithSource.changes().filter(function(change) {
          return change.source !== source;
        }).map(function(change) {
          return change.value;
        });
      };
      model.addSource = function(source) {
        return model.apply(source.map(function(v) {
          return function() {
            return v;
          };
        }));
      };
      model.modify = function(f) {
        return model.apply(Bacon.once(f));
      };
      model.set = function(value) {
        return model.modify(function() {
          return value;
        });
      };
      model.get = function() {
        return currentValue;
      };
      model.syncEvents = function() {
        return valueWithSource.toEventStream();
      };
      model.bind = function(other) {
        this.addSyncSource(other.syncEvents());
        return other.addSyncSource(this.syncEvents());
      };
      model.onValue();
      if (arguments.length >= 1) {
        model.set(initValue);
      }
      model.lens = function(lens) {
        var lensed;
        lens = Lens(lens);
        lensed = Model();
        this.addSyncSource(model.sampledBy(lensed.syncEvents(), function(full, lensedSync) {
          return valueLens.set(lensedSync, lens.set(full, lensedSync.value));
        }));
        lensed.addSyncSource(this.syncEvents().map(function(e) {
          return valueLens.set(e, lens.get(e.value));
        }));
        return lensed;
      };
      model.syncConverter = id;
      return model;
    };
    Bacon.Model.syncCount = 0;
    Model.combine = function(template) {
      var initValue, key, lens, lensedModel, model, value;
      if (typeof template !== "object") {
        return Model(template);
      } else if (isModel(template)) {
        return template;
      } else {
        initValue = template instanceof Array ? [] : {};
        model = Model(initValue);
        for (key in template) {
          value = template[key];
          lens = Lens.objectLens(key);
          lensedModel = model.lens(lens);
          lensedModel.bind(Model.combine(value));
        }
        return model;
      }
    };
    Bacon.Binding = Bacon.$.Binding = function(_arg) {
      var events, externalChanges, get, initValue, inputs, model, set;
      initValue = _arg.initValue, get = _arg.get, events = _arg.events, set = _arg.set;
      inputs = events.map(get);
      if (initValue != null) {
        set(initValue);
      } else {
        initValue = get();
      }
      model = Bacon.Model(initValue);
      externalChanges = model.addSource(inputs);
      externalChanges.assign(set);
      return model;
    };
    Lens = Bacon.Lens = Bacon.$.Lens = function(lens) {
      if (typeof lens === "object") {
        return lens;
      } else {
        return Lens.objectLens(lens);
      }
    };
    Lens.id = Lens({
      get: function(x) {
        return x;
      },
      set: function(context, value) {
        return value;
      }
    });
    Lens.objectLens = function(path) {
      var keys, objectKeyLens;
      objectKeyLens = function(key) {
        return Lens({
          get: function(x) {
            return x[key];
          },
          set: function(context, value) {
            return shallowCopy(context, key, value);
          }
        });
      };
      keys = path.split(".").filter(nonEmpty);
      return Lens.compose.apply(Lens, keys.map(objectKeyLens));
    };
    Lens.compose = function() {
      var args, compose2;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      compose2 = function(outer, inner) {
        return Lens({
          get: function(x) {
            return inner.get(outer.get(x));
          },
          set: function(context, value) {
            var innerContext, newInnerContext;
            innerContext = outer.get(context);
            newInnerContext = inner.set(innerContext, value);
            return outer.set(context, newInnerContext);
          }
        });
      };
      return fold(args, Lens.id, compose2);
    };
    valueLens = Lens.objectLens("value");
    shallowCopy = function(x, key, value) {
      var copy, k, v;
      copy = x instanceof Array ? [] : {};
      for (k in x) {
        v = x[k];
        copy[k] = v;
      }
      if (key != null) {
        copy[key] = value;
      }
      return copy;
    };
    $.fn.asEventStream = Bacon.$.asEventStream;
    Bacon.$.textFieldValue = function(element, initValue) {
      var autofillPoller, events, get;
      get = function() {
        return element.val();
      };
      autofillPoller = function() {
        return Bacon.interval(50).take(10).map(get).filter(nonEmpty).take(1);
      };
      events = element.asEventStream("keyup input").merge(element.asEventStream("cut paste").delay(1)).merge(autofillPoller());
      return Bacon.Binding({
        initValue: initValue,
        get: get,
        events: events,
        set: function(value) {
          return element.val(value);
        }
      });
    };
    Bacon.$.checkBoxValue = function(element, initValue) {
      return Bacon.Binding({
        initValue: initValue,
        get: function() {
          return element.is(":checked");
        },
        events: element.asEventStream("change"),
        set: function(value) {
          return element.attr("checked", value);
        }
      });
    };
    Bacon.$.selectValue = function(element, initValue) {
      return Bacon.Binding({
        initValue: initValue,
        get: function() {
          return element.val();
        },
        events: element.asEventStream("change"),
        set: function(value) {
          return element.val(value);
        }
      });
    };
    Bacon.$.radioGroupValue = function(radios, initValue) {
      return Bacon.Binding({
        initValue: initValue,
        get: function() {
          return radios.filter(":checked").first().val();
        },
        events: radios.asEventStream("change"),
        set: function(value) {
          return radios.each(function(i, elem) {
            if (elem.value === value) {
              return $(elem).attr("checked", true);
            } else {
              return $(elem).removeAttr("checked");
            }
          });
        }
      });
    };
    Bacon.$.checkBoxGroupValue = function(checkBoxes, initValue) {
      return Bacon.Binding({
        initValue: initValue,
        get: function() {
          return checkBoxes.filter(":checked").map(function(i, elem) {
            return $(elem).val();
          }).toArray();
        },
        events: checkBoxes.asEventStream("change"),
        set: function(value) {
          return checkBoxes.each(function(i, elem) {
            return $(elem).attr("checked", value.indexOf($(elem).val()) >= 0);
          });
        }
      });
    };
    Bacon.$.ajax = function(params, abort) {
      return Bacon.fromPromise($.ajax(params), abort);
    };
    Bacon.$.ajaxGet = function(url, data, dataType, abort) {
      return Bacon.$.ajax({
        url: url,
        dataType: dataType,
        data: data
      }, abort);
    };
    Bacon.$.ajaxGetJSON = function(url, data, abort) {
      return Bacon.$.ajax({
        url: url,
        dataType: "json",
        data: data
      }, abort);
    };
    Bacon.$.ajaxPost = function(url, data, dataType, abort) {
      return Bacon.$.ajax({
        url: url,
        dataType: dataType,
        data: data,
        type: "POST"
      }, abort);
    };
    Bacon.$.ajaxGetScript = function(url, abort) {
      return Bacon.$.ajax({
        url: url,
        dataType: "script"
      }, abort);
    };
    Bacon.$.lazyAjax = function(params) {
      return Bacon.once(params).flatMap(Bacon.$.ajax);
    };
    Bacon.Observable.prototype.ajax = function() {
      return this.flatMapLatest(Bacon.$.ajax);
    };
    $.fn.extend({
      keydownE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["keydown"].concat(__slice.call(args)));
      },
      keyupE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["keyup"].concat(__slice.call(args)));
      },
      keypressE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["keypress"].concat(__slice.call(args)));
      },
      clickE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["click"].concat(__slice.call(args)));
      },
      dblclickE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["dblclick"].concat(__slice.call(args)));
      },
      mousedownE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["mousedown"].concat(__slice.call(args)));
      },
      mouseupE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["mouseup"].concat(__slice.call(args)));
      },
      mouseenterE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["mouseenter"].concat(__slice.call(args)));
      },
      mouseleaveE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["mouseleave"].concat(__slice.call(args)));
      },
      mousemoveE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["mousemove"].concat(__slice.call(args)));
      },
      mouseoutE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["mouseout"].concat(__slice.call(args)));
      },
      mouseoverE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["mouseover"].concat(__slice.call(args)));
      },
      resizeE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["resize"].concat(__slice.call(args)));
      },
      scrollE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["scroll"].concat(__slice.call(args)));
      },
      selectE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["select"].concat(__slice.call(args)));
      },
      changeE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["change"].concat(__slice.call(args)));
      },
      submitE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["submit"].concat(__slice.call(args)));
      },
      blurE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["blur"].concat(__slice.call(args)));
      },
      focusE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["focus"].concat(__slice.call(args)));
      },
      focusinE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["focusin"].concat(__slice.call(args)));
      },
      focusoutE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["focusout"].concat(__slice.call(args)));
      },
      loadE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["load"].concat(__slice.call(args)));
      },
      unloadE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.asEventStream.apply(this, ["unload"].concat(__slice.call(args)));
      }
    });
    $.fn.extend({
      animateE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return Bacon.fromPromise(this.animate.apply(this, args).promise());
      },
      showE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return Bacon.fromPromise(this.show.apply(this, args).promise());
      },
      hideE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return Bacon.fromPromise(this.hide.apply(this, args).promise());
      },
      toggleE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return Bacon.fromPromise(this.toggle.apply(this, args).promise());
      },
      fadeInE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return Bacon.fromPromise(this.fadeIn.apply(this, args).promise());
      },
      fadeOutE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return Bacon.fromPromise(this.fadeOut.apply(this, args).promise());
      },
      fadeToE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return Bacon.fromPromise(this.fadeTo.apply(this, args).promise());
      },
      fadeToggleE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return Bacon.fromPromise(this.fadeToggle.apply(this, args).promise());
      },
      slideDownE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return Bacon.fromPromise(this.slideDown.apply(this, args).promise());
      },
      slideUpE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return Bacon.fromPromise(this.slideUp.apply(this, args).promise());
      },
      slideToggleE: function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return Bacon.fromPromise(this.slideToggle.apply(this, args).promise());
      }
    });
    return Bacon.$;
  };

  if (typeof module !== "undefined" && module !== null) {
    Bacon = require("baconjs");
    $ = require("jquery");
    module.exports = init(Bacon, $);
  } else {
    if (typeof define === "function" && define.amd) {
      define(["bacon", "jquery"], init);
    } else {
      init(this.Bacon, this.$);
    }
  }

}).call(this);
