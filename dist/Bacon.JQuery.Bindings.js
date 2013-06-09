(function() {
  var $, Bacon, init;

  init = function(Bacon, $) {
    var ValueChange;
    if (!Bacon.Binding) {
      Bacon.Binding = function(initValue) {
        var binding, valueBus;
        valueBus = new Bacon.Bus();
        binding = valueBus.toProperty().map(function(change) {
          return change.value;
        }).skipDuplicates();
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
          this.addSource(other);
          return other.addSource(this);
        };
        binding.push = function(value) {
          return valueBus.push(ValueChange(void 0, value));
        };
        binding.onValue(function() {});
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
      var binding, current, externalChanges, inputs;
      current = function() {
        return element.val();
      };
      inputs = element.asEventStream("keyup").map(current);
      if (initValue != null) {
        element.val(initValue);
      } else {
        initValue = current();
      }
      binding = Bacon.Binding(initValue);
      externalChanges = binding.addSource(inputs);
      externalChanges.assign(element, "val");
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
