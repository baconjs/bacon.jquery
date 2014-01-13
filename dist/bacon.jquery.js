(function() {
  var $, Bacon, BaconModel, init,
    __slice = [].slice;

  init = function(Bacon, BaconModel, $) {
    var nonEmpty, _;
    nonEmpty = function(x) {
      return x.length > 0;
    };
    _ = {
      indexOf: Array.prototype.indexOf ? function(xs, x) {
        return xs.indexOf(x);
      } : function(xs, x) {
        var i, y, _i, _len;
        for (i = _i = 0, _len = xs.length; _i < _len; i = ++_i) {
          y = xs[i];
          if (x === y) {
            return i;
          }
        }
        return -1;
      }
    };
    Bacon.$.Model = Bacon.Model;
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
            return $(elem).attr("checked", _.indexOf(value, $(elem).val()) >= 0);
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
    BaconModel = require("bacon.model");
    $ = require("jquery");
    module.exports = init(Bacon, BaconModel, $);
  } else {
    if (typeof define === "function" && define.amd) {
      define(["bacon", "bacon.model", "jquery"], init);
    } else {
      init(this.Bacon, this.BaconModel, this.$);
    }
  }

}).call(this);
