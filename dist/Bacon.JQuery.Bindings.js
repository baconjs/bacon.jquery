(function() {
  var $, Bacon, init;

  init = function(Bacon, $) {
    var ValueChange, count, isChrome, _ref;
    isChrome = (typeof navigator !== "undefined" && navigator !== null ? (_ref = navigator.userAgent) != null ? _ref.toLowerCase().indexOf("chrome") : void 0 : void 0) > -1;
    count = 0;
    if (!Bacon.Binding) {
      Bacon.Binding = Bacon.$.Binding = function(initValue) {
        var binding, myCount, valueBus;
        myCount = ++count;
        valueBus = new Bacon.Bus();
        binding = valueBus.map(function(change) {
          return change.value;
        }).toProperty().skipDuplicates();
        binding.addSource = function(source) {
          valueBus.plug(source.map(function(value) {
            return ValueChange(source, value);
          }));
          return valueBus.filter(function(change) {
            return change.source !== source;
          }).map(function(change) {
            return change.value;
          });
        };
        binding.bind = function(other) {
          this.addSource(other.toEventStream());
          return other.addSource(this.toEventStream());
        };
        binding.push = function(value) {
          return valueBus.push(ValueChange(void 0, value));
        };
        binding.onValue();
        if ((initValue != null)) {
          binding.push(initValue);
        }
        return binding;
      };
      ValueChange = function(source, value) {
        return {
          source: source,
          value: value
        };
      };
    }
    $.fn.asEventStream = Bacon.$.asEventStream;
    Bacon.$.textFieldValue = function(element, initValue) {
      var autofillPoller, currentFromDom, domEvents, nonEmpty;
      nonEmpty = function(x) {
        return x.length > 0;
      };
      currentFromDom = function() {
        return element.val();
      };
      autofillPoller = function() {
        if (element.attr("type") === "password") {
          return Bacon.interval(100);
        } else if (isChrome) {
          return Bacon.interval(100).take(20).map(currentFromDom).filter(nonEmpty).take(1);
        } else {
          return Bacon.never();
        }
      };
      domEvents = element.asEventStream("keyup input").merge(element.asEventStream("cut paste").delay(1)).merge(autofillPoller());
      return Bacon.$.domBinding({
        initValue: initValue,
        currentFromDom: currentFromDom,
        domEvents: domEvents,
        setToDom: function(value) {
          return element.val(value);
        }
      });
    };
    Bacon.$.checkBoxValue = function(element, initValue) {
      return Bacon.$.domBinding({
        initValue: initValue,
        currentFromDom: function() {
          return !!element.attr("checked");
        },
        domEvents: element.asEventStream("change"),
        setToDom: function(value) {
          return element.attr("checked", value);
        }
      });
    };
    Bacon.$.selectValue = function(element, initValue) {
      return Bacon.$.domBinding({
        initValue: initValue,
        currentFromDom: function() {
          return element.val();
        },
        domEvents: element.asEventStream("change"),
        setToDom: function(value) {
          return element.val(value);
        }
      });
    };
    Bacon.$.radioGroupValue = function(radios, initValue) {
      return Bacon.$.domBinding({
        initValue: initValue,
        currentFromDom: function() {
          return radios.filter(":checked").first().val();
        },
        domEvents: radios.asEventStream("change"),
        setToDom: function(value) {
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
    Bacon.$.domBinding = function(_arg) {
      var binding, currentFromDom, domEvents, externalChanges, initValue, inputs, setToDom;
      initValue = _arg.initValue, currentFromDom = _arg.currentFromDom, domEvents = _arg.domEvents, setToDom = _arg.setToDom;
      inputs = domEvents.map(currentFromDom);
      if (initValue != null) {
        setToDom(initValue);
      } else {
        initValue = currentFromDom();
      }
      binding = Bacon.Binding(initValue);
      externalChanges = binding.addSource(inputs);
      externalChanges.assign(setToDom);
      return binding;
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
