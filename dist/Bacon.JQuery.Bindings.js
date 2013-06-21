(function() {
  var $, Bacon, init;

  init = function(Bacon, $) {
    var ValueChange, count;
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
      return Bacon.$.domBinding({
        initValue: initValue,
        currentFromDom: function() {
          return element.val();
        },
        domEvents: element.asEventStream("keyup"),
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
