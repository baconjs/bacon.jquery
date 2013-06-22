init = (Bacon, $) ->
  isChrome = navigator?.userAgent?.toLowerCase().indexOf("chrome") > -1

  count = 0
  if not Bacon.Binding
    Bacon.Binding = Bacon.$.Binding = (initValue) ->
        myCount = ++count
        modificationBus = new Bacon.Bus()
        valueWithSource = modificationBus.scan(
          {}
          ({value}, {source, f}) -> {source, value: f(value)}
        ).changes()
        binding = valueWithSource.toProperty().map(".value").skipDuplicates()
        binding.addSource = (source) ->
          modificationBus.plug(source.map((value) -> {source, f: -> value}))
          valueWithSource.filter((change) -> change.source != source).map((change) -> change.value)
        binding.bind = (other) ->
          this.addSource(other.toEventStream())
          other.addSource(this.toEventStream())
        binding.modify = (f) -> modificationBus.push { f }
        binding.set = (value) -> binding.modify(-> value)
        binding.onValue()
        binding.set(initValue) if (initValue?)
        binding

  $.fn.asEventStream = Bacon.$.asEventStream
  Bacon.$.textFieldValue = (element, initValue) ->
    nonEmpty = (x) -> x.length > 0
    currentFromDom = -> element.val()
    autofillPoller = ->
      if element.attr("type") is "password"
        Bacon.interval 100
      else if isChrome
        Bacon.interval(100).take(20).map(currentFromDom).filter(nonEmpty).take 1
      else
        Bacon.never()
    domEvents = element.asEventStream("keyup input")
      .merge(element.asEventStream("cut paste").delay(1))
      .merge(autofillPoller())

    Bacon.$.domBinding {
      initValue,
      currentFromDom,
      domEvents,
      setToDom: (value) -> element.val(value)
    }
  Bacon.$.checkBoxValue = (element, initValue) ->
    Bacon.$.domBinding {
      initValue,
      currentFromDom: -> !!element.attr("checked"),
      domEvents: element.asEventStream("change"),
      setToDom: (value) -> element.attr "checked", value
    }
  
  Bacon.$.selectValue = (element, initValue) ->
    Bacon.$.domBinding {
      initValue,
      currentFromDom: -> element.val(),
      domEvents: element.asEventStream("change"),
      setToDom: (value) -> element.val value
    }

  Bacon.$.radioGroupValue = (radios, initValue) ->
    Bacon.$.domBinding {
      initValue,
      currentFromDom: -> radios.filter(":checked").first().val(),
      domEvents: radios.asEventStream("change"),
      setToDom: (value) ->
        radios.each (i, elem) ->
          if elem.value is value
            $(elem).attr "checked", true 
          else
            $(elem).removeAttr "checked"
    }

  Bacon.$.checkBoxGroupValue = (checkBoxes, initValue) ->
    Bacon.$.domBinding {
      initValue,
      currentFromDom: -> selectedValues = ->
        checkBoxes.filter(":checked").map((i, elem) -> $(elem).val()).toArray()
      domEvents: checkBoxes.asEventStream("click,change"),
      setToDom: (value) ->
        checkBoxes.each (i, elem) ->
          $(elem).attr "checked", value.indexOf($(elem).val()) >= 0
    }

  Bacon.$.domBinding = ({ initValue, currentFromDom, domEvents, setToDom}) ->
    inputs = domEvents.map(currentFromDom)
    if initValue?
      setToDom(initValue)
    else
      initValue = currentFromDom()
    binding = Bacon.Binding(initValue)
    externalChanges = binding.addSource(inputs)
    externalChanges.assign(setToDom)
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
