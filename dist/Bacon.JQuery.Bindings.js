(function() {
  var $, Bacon, init;

  init = function(Bacon, $) {
    var count, isChrome, _ref;
    isChrome = (typeof navigator !== "undefined" && navigator !== null ? (_ref = navigator.userAgent) != null ? _ref.toLowerCase().indexOf("chrome") : void 0 : void 0) > -1;
    count = 0;
    Bacon.Model = Bacon.$.Model = function(initValue) {
      var binding, modificationBus, myCount, valueWithSource;
      myCount = ++count;
      modificationBus = new Bacon.Bus();
      valueWithSource = modificationBus.scan({}, function(_arg, _arg1) {
        var f, source, value;
        value = _arg.value;
        source = _arg1.source, f = _arg1.f;
        return {
          source: source,
          value: f(value)
        };
      }).changes();
      binding = valueWithSource.toProperty().map(".value").skipDuplicates();
      binding.apply = function(source) {
        modificationBus.plug(source.map(function(f) {
          return {
            source: source,
            f: function(value) {
              return f(value);
            }
          };
        }));
        return valueWithSource.filter(function(change) {
          return change.source !== source;
        }).map(function(change) {
          return change.value;
        });
      };
      binding.addSource = function(source) {
        return binding.apply(source.map(function(v) {
          return function() {
            return v;
          };
        }));
      };
      binding.modify = function(f) {
        return binding.apply(Bacon.once(f));
      };
      binding.set = function(value) {
        return binding.modify(function() {
          return value;
        });
      };
      binding.bind = function(other) {
        this.addSource(other.toEventStream());
        return other.addSource(this.toEventStream());
      };
      binding.onValue();
      if ((initValue != null)) {
        binding.set(initValue);
      }
      return binding;
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
    $.fn.asEventStream = Bacon.$.asEventStream;
    Bacon.$.textFieldValue = function(element, initValue) {
      var autofillPoller, events, get, nonEmpty;
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
