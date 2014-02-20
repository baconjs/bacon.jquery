init = (Bacon, BaconModel, $) ->
  nonEmpty = (x) -> x.length > 0
  _ = {
  indexOf: if Array::indexOf
    (xs, x) -> xs.indexOf(x)
  else
    (xs, x) ->
      for y, i in xs
        return i if x == y
      -1
  }

  Bacon.$.Model = Bacon.Model

  $.fn.asEventStream = Bacon.$.asEventStream

  # Input element bindings
  Bacon.$.textFieldValue = (element, initValue) ->
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
      get: -> element.is(":checked"),
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
          $(elem).attr "checked", _.indexOf(value, $(elem).val()) >= 0
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

  eventNames = [
    "keydown", "keyup", "keypress",
    "click", "dblclick", "mousedown", "mouseup",
    "mouseenter", "mouseleave", "mousemove", "mouseout", "mouseover",
    "resize", "scroll", "select", "change",
    "submit",
    "blur", "focus", "focusin", "focusout",
    "load", "unload" ]
  events = {}

  for e in eventNames
    events[e + 'E'] = (args...) -> @asEventStream e, args...

  $.fn.extend events

  # jQuery Effects

  effectNames = [
    "animate", "show", "hide", "toggle",
    "fadeIn", "fadeOut", "fadeTo", "fadeToggle",
    "slideDown", "slideUp", "slideToggle" ]
  effects = {}

  for e in effectNames
    effects[e + 'E'] = (args...) -> Bacon.fromPromise @[e](args...).promise()

  $.fn.extend effects

  Bacon.$

if module?
  Bacon = require("baconjs")
  BaconModel = require("bacon.model")
  $ = require("jquery")
  module.exports = init(Bacon, BaconModel, $)
else
  if typeof define == "function" and define.amd
    define ["bacon", "bacon.model", "jquery"], init
  else
    init(this.Bacon, this.BaconModel, this.$)
