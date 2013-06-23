(function() {
  var $, Bacon, init,
    __slice = [].slice;

  init = function(Bacon, $) {
    var Lens, Model, fold, globalModCount, id, idCounter, isChrome, isModel, nonEmpty, shallowCopy, _ref;
    isChrome = (typeof navigator !== "undefined" && navigator !== null ? (_ref = navigator.userAgent) != null ? _ref.toLowerCase().indexOf("chrome") : void 0 : void 0) > -1;
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
    Model = Bacon.Model = Bacon.$.Model = function(initValue) {
      var model, modificationBus, myModCount, syncBus, valueWithSource;
      myModCount = 0;
      modificationBus = new Bacon.Bus();
      syncBus = new Bacon.Bus();
      valueWithSource = modificationBus.scan({
        initial: true
      }, function(_arg, _arg1) {
        var f, source, value;
        value = _arg.value;
        source = _arg1.source, f = _arg1.f;
        return {
          source: source,
          value: f(value),
          modCount: ++globalModCount
        };
      }).changes().merge(syncBus).toProperty();
      model = valueWithSource.map(".value").skipDuplicates();
      model.id = idCounter++;
      model.addSyncSource = function(syncEvents) {
        return syncBus.plug(syncEvents.filter(function(e) {
          var pass;
          pass = e.modCount !== myModCount;
          myModCount = e.modCount;
          return pass;
        }));
      };
      model.apply = function(source) {
        modificationBus.plug(source.map(function(f) {
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
      model.syncEvents = function() {
        return valueWithSource.toEventStream();
      };
      model.bind = function(other) {
        this.addSyncSource(other.syncEvents());
        return other.addSyncSource(this.syncEvents());
      };
      model.onValue();
      if ((initValue != null)) {
        model.set(initValue);
      }
      model.lens = function(lens) {
        var lensed, valueLens;
        lens = Lens(lens);
        lensed = Model();
        valueLens = Lens.objectLens("value");
        this.addSyncSource(model.sampledBy(lensed.syncEvents(), function(full, lensedSync) {
          return valueLens.set(lensedSync, lens.set(full, lensedSync.value));
        }));
        lensed.addSyncSource(this.syncEvents().map(function(e) {
          return valueLens.set(e, lens.get(e.value));
        }));
        return lensed;
      };
      return model;
    };
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
      var binding, events, externalChanges, get, initValue, inputs, set;
      initValue = _arg.initValue, get = _arg.get, events = _arg.events, set = _arg.set;
      inputs = events.map(get);
      if (initValue != null) {
        set(initValue);
      } else {
        initValue = get();
      }
      binding = Bacon.Model(initValue);
      externalChanges = binding.addSource(inputs);
      externalChanges.assign(set);
      return binding;
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
            context = shallowCopy(context);
            context[key] = value;
            return context;
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
    shallowCopy = function(x) {
      var copy, key, value;
      copy = x instanceof Array ? [] : {};
      for (key in x) {
        value = x[key];
        copy[key] = value;
      }
      return copy;
    };
    $.fn.asEventStream = Bacon.$.asEventStream;
    Bacon.$.textFieldValue = function(element, initValue) {
      var autofillPoller, events, get;
      nonEmpty = function(x) {
        return x.length > 0;
      };
      get = function() {
        return element.val();
      };
      autofillPoller = function() {
        if (element.attr("type") === "password") {
          return Bacon.interval(100);
        } else if (isChrome) {
          return Bacon.interval(100).take(20).map(get).filter(nonEmpty).take(1);
        } else {
          return Bacon.never();
        }
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
          return !!element.attr("checked");
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
          var selectedValues;
          return selectedValues = function() {
            return checkBoxes.filter(":checked").map(function(i, elem) {
              return $(elem).val();
            }).toArray();
          };
        },
        events: checkBoxes.asEventStream("click,change"),
        set: function(value) {
          return checkBoxes.each(function(i, elem) {
            return $(elem).attr("checked", value.indexOf($(elem).val()) >= 0);
          });
        }
      });
    };
    return Bacon.$;
  };

  if (typeof module !== "undefined" && module !== null) {
    Bacon = require("baconjs");
    $ = require("jquery");
    module.exports = init(Bacon, $);
  } else {
    if (typeof require === 'function') {
      define('bacon-jquery-bindings', ["bacon", "jquery"], init);
    } else {
      init(this.Bacon, this.$);
    }
  }

}).call(this);
