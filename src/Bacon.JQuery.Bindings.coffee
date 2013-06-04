init = (Bacon, $) ->
  if not Bacon.Binding
    Bacon.Binding = (initValue) ->
        valueBus = new Bacon.Bus()
        binding = valueBus.toProperty().map((change) -> change.value).skipDuplicates()
        binding.addSource = (source) ->
          valueBus.plug(source.map((value) -> ValueChange(source, value)))
          valueBus.filter((change) -> change.source != source).map((change) -> change.value)
        binding.bind = (other) ->
          this.addSource(other)
          other.addSource(this)
        binding.push = (value) ->
          valueBus.push(ValueChange(undefined, value))
        binding.onValue(->)
        binding.push(initValue) if (initValue?)
        binding

    ValueChange = (source, value) -> { source, value }
  Bacon.$ =
    textFieldValue: (element, initValue) ->
      current = -> element.val()
      inputs = element.asEventStream("keyup").map(current)
      initValue = current() if not initValue?
      binding = Bacon.Binding(initValue)
      externalChanges = binding.addSource(inputs)
      externalChanges.assign(element, "val")
      binding

if module?
  Bacon = require("baconjs")
  $ = require("jquery")
  module.exports = init(Bacon, $)
else
  if typeof require is 'function'
    define 'bacon-jquery-bindings', ["bacon", "jquery"], init
  else
    init(this.Bacon)
