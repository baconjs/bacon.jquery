init = (Bacon, $) ->
  count = 0
  if not Bacon.Binding
    Bacon.Binding = Bacon.$.Binding = (initValue) ->
        myCount = ++count
        valueBus = new Bacon.Bus()
        binding = valueBus.map((change) -> 
          change.value).toProperty().skipDuplicates()
        binding.addSource = (source) ->
          valueBus.plug(source.map((value) -> 
            ValueChange(source, value)))
          valueBus.filter((change) -> change.source != source).map((change) -> change.value)
        binding.bind = (other) ->
          this.addSource(other.toEventStream())
          other.addSource(this.toEventStream())
        binding.push = (value) ->
          valueBus.push(ValueChange(undefined, value))
        binding.onValue()
        binding.push(initValue) if (initValue?)
        binding

    ValueChange = (source, value) -> { source, value }

  $.fn.asEventStream = Bacon.$.asEventStream
  Bacon.$.textFieldValue = (element, initValue) ->
      current = -> element.val()
      inputs = element.asEventStream("keyup").map(current)
      if initValue?
        element.val(initValue)
      else
        initValue = current()
      binding = Bacon.Binding(initValue)
      externalChanges = binding.addSource(inputs)
      externalChanges.assign(element, "val")
      binding
  Bacon.$.checkBoxValue = (element, initValue) ->
    current = -> !!element.attr("checked")
    inputs = element.asEventStream("change").map(current)
    if initValue?
      element.attr "checked", initValue
    else
      initValue = current()
    binding = Bacon.Binding(initValue)
    externalChanges = binding.addSource(inputs)
    externalChanges.assign(element, "attr", "checked")
    binding

  Bacon.$

if module?
  Bacon = require("baconjs")
  $ = require("jquery")
  module.exports = init(Bacon, $)
else
  if typeof require is 'function'
    define 'bacon-jquery-bindings', ["bacon", "jquery"], init
  else
    init(this.Bacon, this.$)
