init = (Bacon, BaconModel, $) ->
  nonEmpty = (x) -> x.length > 0
  
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
