init = (Bacon, $) ->
  isChrome = navigator?.userAgent?.toLowerCase().indexOf("chrome") > -1

  count = 0

  Bacon.Model = Bacon.$.Model = (initValue) ->
        myCount = ++count
        modificationBus = new Bacon.Bus()
        valueWithSource = modificationBus.scan(
          {}
          ({value}, {source, f}) -> {source, value: f(value)}
        ).changes()
        binding = valueWithSource.toProperty().map(".value").skipDuplicates()
        binding.apply = (source) -> 
          modificationBus.plug(source.map((f) -> {source, f: (value) -> f(value)}))
          valueWithSource.filter((change) -> change.source != source).map((change) -> change.value)
        binding.addSource = (source) -> binding.apply(source.map((v) -> (->v)))
        binding.modify = (f) -> binding.apply(Bacon.once(f))
        binding.set = (value) -> binding.modify(-> value)
        binding.bind = (other) ->
          this.addSource(other.toEventStream())
          other.addSource(this.toEventStream())
        binding.onValue()
        binding.set(initValue) if (initValue?)
        binding

  Bacon.Binding = Bacon.$.Binding = ({ initValue, get, events, set}) ->
    inputs = events.map(get)
    if initValue?
      set(initValue)
    else
      initValue = get()
    binding = Bacon.Model(initValue)
    externalChanges = binding.addSource(inputs)
    externalChanges.assign(set)
    binding


  $.fn.asEventStream = Bacon.$.asEventStream
  Bacon.$.textFieldValue = (element, initValue) ->
    nonEmpty = (x) -> x.length > 0
    get = -> element.val()
    autofillPoller = ->
      if element.attr("type") is "password"
        Bacon.interval 100
      else if isChrome
        Bacon.interval(100).take(20).map(get).filter(nonEmpty).take 1
      else
        Bacon.never()
    events = element.asEventStream("keyup input")
      .merge(element.asEventStream("cut paste").delay(1))
      .merge(autofillPoller())

    Bacon.Binding {
      initValue,
      get,
      events,
      set: (value) -> element.val(value)
    }
  Bacon.$.checkBoxValue = (element, initValue) ->
    Bacon.Binding {
      initValue,
      get: -> !!element.attr("checked"),
      events: element.asEventStream("change"),
      set: (value) -> element.attr "checked", value
    }
  
  Bacon.$.selectValue = (element, initValue) ->
    Bacon.Binding {
      initValue,
      get: -> element.val(),
      events: element.asEventStream("change"),
      set: (value) -> element.val value
    }

  Bacon.$.radioGroupValue = (radios, initValue) ->
    Bacon.Binding {
      initValue,
      get: -> radios.filter(":checked").first().val(),
      events: radios.asEventStream("change"),
      set: (value) ->
        radios.each (i, elem) ->
          if elem.value is value
            $(elem).attr "checked", true 
          else
            $(elem).removeAttr "checked"
    }

  Bacon.$.checkBoxGroupValue = (checkBoxes, initValue) ->
    Bacon.Binding {
      initValue,
      get: -> selectedValues = ->
        checkBoxes.filter(":checked").map((i, elem) -> $(elem).val()).toArray()
      events: checkBoxes.asEventStream("click,change"),
      set: (value) ->
        checkBoxes.each (i, elem) ->
          $(elem).attr "checked", value.indexOf($(elem).val()) >= 0
    }

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
