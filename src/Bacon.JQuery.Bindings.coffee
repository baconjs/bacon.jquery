init = (Bacon, $) ->
  isChrome = navigator?.userAgent?.toLowerCase().indexOf("chrome") > -1
  id = (x) -> x
  nonEmpty = (x) -> x.length > 0
  fold = (xs, seed, f) ->
    for x in xs
      seed = f(seed, x)
    seed
  isModel = (obj) -> obj instanceof Bacon.Property

  Model = Bacon.Model = Bacon.$.Model = (initValue) ->
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
    binding.lens = (lens) ->
      lens = Lens(lens)
      lensed = Model()
      this.addSource(binding.sampledBy(lensed.toEventStream(), lens.set))
      lensed.addSource(this.toEventStream().map(lens.get))
      lensed
    binding

  Model.combine = (template) ->
    if typeof template != "object"
      Model(template)
    else if isModel(template)
      template
    else
      initValue = if template instanceof Array then [] else {}
      model = Model(initValue)
      for key, value of template
        lens = Lens.objectLens(key)
        lensedModel = model.lens(lens)
        lensedModel.bind(Model.combine(value))
      model

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

  Lens = Bacon.Lens = Bacon.$.Lens = (lens) ->
    if typeof lens == "object"
      lens
    else
      Lens.objectLens(lens)

  Lens.id = Lens {
    get: (x) -> x
    set: (context, value) -> value
  }

  Lens.objectLens = (path) ->
    objectKeyLens = (key) -> 
      Lens {
        get: (x) -> x[key],
        set: (context, value) ->
          context = shallowCopy(context)
          context[key] = value
          context
      }
    keys = path.split(".").filter(nonEmpty)
    Lens.compose(keys.map(objectKeyLens)...)

  Lens.compose = (args...) -> 
    compose2 = (outer, inner) -> Lens {
      get: (x) -> inner.get(outer.get(x)),
      set: (context, value) ->
        innerContext = outer.get(context)
        newInnerContext = inner.set(innerContext, value)
        outer.set(context, newInnerContext)
    }
    fold(args, Lens.id, compose2)

  shallowCopy = (x) ->
    copy = if x instanceof Array
      []
    else
      {}
    for key, value of x
      copy[key] = value
    copy

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
