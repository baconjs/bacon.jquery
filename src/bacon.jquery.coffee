`import Bacon from "baconjs"`
`import $ from "jquery"`

id = (x) -> x
nonEmpty = (x) -> x.length > 0
fold = (xs, seed, f) ->
  for x in xs
    seed = f(seed, x)
  seed
isModel = (obj) -> obj instanceof Bacon.Property

globalModCount = 0
idCounter = 1

Model = Bacon.Model = Bacon.$.Model = (initValue) ->
  myModCount = 0
  modificationBus = new Bacon.Bus()
  syncBus = new Bacon.Bus()
  valueWithSource = Bacon.update(
    { initial: true },
    [modificationBus], (({value}, {source, f}) -> 
      {source, value: f(value), modCount: ++globalModCount}),
    [syncBus], ((_, syncEvent) -> syncEvent)
  ).changes().toProperty()
  model = valueWithSource.map(".value").skipDuplicates()
  model.id = idCounter++
  model.addSyncSource = (syncEvents) ->
    syncBus.plug(syncEvents.filter((e) ->
        pass = e.modCount != myModCount
        myModCount = e.modCount
        pass
    ))
  model.apply = (source) -> 
    modificationBus.plug(source.toEventStream().map((f) -> {source, f}))
    valueWithSource.changes()
      .filter((change) -> change.source != source)
      .map((change) -> change.value)
  model.addSource = (source) -> model.apply(source.map((v) -> (->v)))
  model.modify = (f) -> model.apply(Bacon.once(f))
  model.set = (value) -> model.modify(-> value)
  model.syncEvents = -> valueWithSource.toEventStream()
  model.bind = (other) ->
    this.addSyncSource(other.syncEvents())
    other.addSyncSource(this.syncEvents())
  model.onValue()
  model.set(initValue) if (arguments.length >= 1)
  model.lens = (lens) ->
    lens = Lens(lens)
    lensed = Model()
    valueLens = Lens.objectLens("value")
    this.addSyncSource(model.sampledBy(lensed.syncEvents(), (full, lensedSync) ->
      valueLens.set(lensedSync, lens.set(full, lensedSync.value))
    ))
    lensed.addSyncSource(this.syncEvents().map((e) -> 
      valueLens.set(e, lens.get(e.value))))
    lensed
  model

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
  model = Bacon.Model(initValue)
  externalChanges = model.addSource(inputs)
  externalChanges.assign(set)
  model

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

# Input element bindings
Bacon.$.textFieldValue = (element, initValue) ->
  nonEmpty = (x) -> x.length > 0
  get = -> element.val()
  autofillPoller = ->
    Bacon.interval(50).take(10).map(get).filter(nonEmpty).take 1
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
    get: ->
      checkBoxes.filter(":checked").map((i, elem) -> $(elem).val()).toArray()
    events: checkBoxes.asEventStream("change"),
    set: (value) ->
      checkBoxes.each (i, elem) ->
        $(elem).attr "checked", value.indexOf($(elem).val()) >= 0
  }

# AJAX
Bacon.$.ajax = (params, abort) -> Bacon.fromPromise $.ajax(params), abort
Bacon.$.ajaxGet = (url, data, dataType, abort) -> Bacon.$.ajax({url, dataType, data}, abort)       
Bacon.$.ajaxGetJSON = (url, data, abort) -> Bacon.$.ajax({url, dataType: "json", data}, abort)         
Bacon.$.ajaxPost = (url, data, dataType, abort) -> Bacon.$.ajax({url, dataType, data, type: "POST"}, abort)
Bacon.$.ajaxGetScript = (url, abort) -> Bacon.$.ajax({url, dataType: "script"}, abort)
Bacon.$.lazyAjax = (params) -> Bacon.once(params).flatMap(Bacon.$.ajax)
Bacon.Observable::ajax = -> @flatMapLatest Bacon.$.ajax

# jQuery DOM Events
$.fn.extend
  keydownE: (args...) -> @asEventStream "keydown", args...
  keyupE: (args...) -> @asEventStream "keyup", args...
  keypressE: (args...) -> @asEventStream "keypress", args...

  clickE: (args...) -> @asEventStream "click", args... 
  dblclickE: (args...) -> @asEventStream "dblclick", args... 
  mousedownE: (args...) -> @asEventStream "mousedown", args... 
  mouseupE: (args...) -> @asEventStream "mouseup", args...

  mouseenterE: (args...) -> @asEventStream "mouseenter", args...
  mouseleaveE: (args...) -> @asEventStream "mouseleave", args...
  mousemoveE: (args...) -> @asEventStream "mousemove", args...
  mouseoutE: (args...) -> @asEventStream "mouseout", args...
  mouseoverE: (args...) -> @asEventStream "mouseover", args...

  resizeE: (args...) -> @asEventStream "resize", args...
  scrollE: (args...) -> @asEventStream "scroll", args...
  selectE: (args...) -> @asEventStream "select", args...
  changeE: (args...) -> @asEventStream "change", args...

  submitE: (args...) -> @asEventStream "submit", args...

  blurE: (args...) -> @asEventStream "blur", args...
  focusE: (args...) -> @asEventStream "focus", args...
  focusinE: (args...) -> @asEventStream "focusin", args...
  focusoutE: (args...) -> @asEventStream "focusout", args...

  loadE: (args...) -> @asEventStream "load", args...
  unloadE: (args...) -> @asEventStream "unload", args...

# jQuery Effects
$.fn.extend
  animateE: (args...) -> Bacon.fromPromise @animate(args...).promise()
  showE: (args...) -> Bacon.fromPromise @show(args...).promise()
  hideE: (args...)-> Bacon.fromPromise @hide(args...).promise()
  toggleE: (args...) -> Bacon.fromPromise @toggle(args...).promise()

  fadeInE: (args...) -> Bacon.fromPromise @fadeIn(args...).promise()
  fadeOutE: (args...) -> Bacon.fromPromise @fadeOut(args...).promise()
  fadeToE: (args...) -> Bacon.fromPromise @fadeTo(args...).promise()
  fadeToggleE: (args...) -> Bacon.fromPromise @fadeToggle(args...).promise()

  slideDownE: (args...) -> Bacon.fromPromise @slideDown(args...).promise()
  slideUpE: (args...) -> Bacon.fromPromise @slideUp(args...).promise()
  slideToggleE: (args...) -> Bacon.fromPromise @slideToggle(args...).promise()

`export default Bacon.$`
