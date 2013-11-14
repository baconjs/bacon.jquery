# bacon.jquery

A JQuery data binding library for [Bacon.js](https://github.com/baconjs/bacon.js).

Adds stuff to `Bacon.$`. Is also called BJQ.

Includes

- Binding the state of HTML input elements to `Model` objects that extend
  the Bacon.js `Property` API by providing a bidirectional binding
- Composing `Model` objects using `model.bind`, `Model.combine` and `model.lens`
- Attaching additional input `EventStream` to any `Model` by using
  `model.addSource`
- AJAX helpers. Wrap a JQuery AJAX call into an EventStream using
  `Bacon.$.ajax("/get/stuff")`. Convert an `EventStream` of requests
into an `EventStream` of responses like `requests.ajax()`.
- FRP extensions to JQuery. Wrap JQuery events easily into an `EventStream`, as
  in `$("body").clickE()`

This library is intended as a replacement for [Bacon.UI](https://github.com/raimohanska/Bacon.UI.js). It provides the same functionality, with the addition of two-way bound Models, model composition and lenses.

## Example Applications

There are example applications in the [examples](https://github.com/baconjs/bacon.jquery/tree/master/examples) directory, each with a README.md describing how they are started.

Each application does essentially the same thing and the code in the example applications is essentially just this:

```js
  // binding for "left" text field
  left = bjq.textFieldValue($("#left"))
  // binding for "right" text field
  right = bjq.textFieldValue($("#right"))
  // make a two-way binding between these two
  // values in the two fields will now stay in sync
  right.bind(left)
  // Make a one-way side effect: update label text on changes, uppercase
  right.map(".toUpperCase").changes().assign($("#output"), "text")
  // Add an input stream for resetting the value
  left.addSource($("#reset").asEventStream("click").map(""))
```

## API

The `bacon.jquery` API consists of methods for creating a `Model` representing the
state of a DOM element or a group of DOM elements. This API is published
as `Bacon.$`, and the same object is returned when using AMD or
CommonJS.

###Bacon.$.textFieldValue(field [, initValue])

Creates a `Model` for an
`<input type="text">` element, given as a JQuery object. You can optionally supply an initial value.

###Bacon.$.checkBoxValue(field [, initValue])

Creates a `Model` for a
`<input type="checkbox">` element, given as a JQuery object. The value is `true` if the checkbox is checked and
`false` otherwise.

###Bacon.$.selectValue(field [,initValue])

Creates a `Model` for a `<select>`
element, given as a JQuery object. The value of the model corresponds to the `value` attribute of the selected `<option>` element.

###Bacon.$.radioGroupValue(fields, [,initValue])

Creates a `Model` for a
group of `<input type="radio">` elements, given as a JQuery object. The value
of the model corresponds to the `value` attribute of the selected radio
input element.

###Bacon.$.checkBoxGroupValue(fields, [,initValue])

Creates a `Model` for a group
of `<input type="checkbox">` elements, given as a JQuery object. The value
of the model is an array of the `value` attributes of the checked
checkbox input elements. For instance, if you have checkboxes and 2 of
these are checked, having values `a` and `b`, the value of the Model is
`["a", "b"]`.

TODO: add HTML/JS examples

## FRP extensions to JQuery Events

BJQ adds methods to JQuery, for wrapping events into an `EventStream`.

For example, to wrap click events on `<body>` into an `EventStream`, you
can

    var clicks = $("body").clickE()

Supported methods include the following:

- keydownE
- keyupE
- keypressE
- clickE
- dblclickE
- mousedownE
- mouseupE
- mouseenterE
- mouseleaveE
- mousemoveE
- mouseoutE
- mouseoverE
- resizeE
- scrollE
- selectE
- changeE
- submitE
- blurE
- focusE
- focusinE
- focusoutE
- loadE
- unloadE

## FRP extensions to JQuery Effects

BJQ adds methods to JQuery, for performing animations and wrapping the
result `Promise` into an `EventStream`. For example

    var fadeOut = $("#thing").fadeOutE("fast")

Supported methods include the following:

- animateE
- showE
- hideE
- toggleE
- fadeInE
- fadeOutE
- fadeToE
- fadeToggleE
- slideDownE
- slideUpE
- slideToggleE

## AJAX

BJQ provides helpers for JQuery AJAX. All the methods return an
`EventStream` of AJAX results. AJAX errors are mapped into `Error`
events in the stream.

### stream.ajax(fn)

Performs an AJAX request on each event of your stream, collating results in the result stream.

The source stream is expected to provide the parameters for the AJAX call.

    var usernameRequest = username.map(function(un) { return { type: "get", url: "/usernameavailable/" + un } })
    var usernameAvailable = usernameRequest.changes().ajax()

### Bacon.$.ajax(params)

Performs an AJAX request and returns the results in an EventStream.

    var results = Bacon.$.ajax("/get/results")

or

    var results = Bacon.$.ajax({ url: "/get/results"})

### Bacon.$.ajaxGet(url, data, dataType)

### Bacon.$.ajaxGetJSON(url, data)

### Bacon.$.ajaxPost(url, data, dataType)

### Bacon.$.ajaxGetScripts(url)

## Model API

All the BJQ methods, such as `textFieldValue` return a `Model` object, which is a Bacon.js `Property`, but extends that API by the following methods.

###Bacon.Model(initValue)

Creates a new model, with the given (optional) initial value.

###model.set(value)

Sets a new value for the model, also pushing this
value to all two-way sources.

###model.get()

Returns the current value of the model. If there's no current value,
returns `undefined`.

###model.modify(f)

Modifies the value of the model by applying the
given function to the current value. For instance, if the current value
was `1` and you applied a `multiplyBy2` function, the value would be set
to `2`.

###model.addSource(stream)

Adds an input source for pushing values to
the model. The source may be an EventStream or a Property. The method
returns an EventStream that contains all changes from *other sources*
than this.

###model.apply(stream)

Adds an input source of *modification functions* to the model. The source may be an EventStream or a Property, and is supposed to contain functions as values. Each of these functions are applied as modifications to the value of the model (as with using the `modify` method). The method returns an EventStream that contains all changes from *other sources* than this.

###model.bind(other)

Makes a two-way binding between the two models.

###model.lens(lens)

Creates a new lensed model based on this one. For example:

```js
    car = bjq.Model({ brand: "Ford", engine: "V8" })
    engine = car.lens "engine"
```

Now the `engine` model will have the value "V8". Also, these two models
are bound both ways meaning that changes in `engine` are reflected to
`car` and vice versa.

See Lenses section below for full definition of Lenses.

###Bacon.Model.combine(template)

Creates a composite model using a template. For example:

```js
    // Model for the number of cylinders
    cylinders = bjq.Model(12)
    // Model for the number of doors
    doors = bjq.Model(2)
    // Composite model for the whole car
    car = bjq.Model.combine {
      price: "expensive",
      engine: { type: "gas", cylinders},
      doors
    }
```

The composite model has a bidirectional binding to its components. If
the `cylinders` model is gets a change from a UI, the `car` model is
updated accordingly. Also, if you set the value in the `car` model to,
say `{price: "affordable", engine: { type: "electric", cylinders: 0 },
doors: 4}`, the `cylinders` model will get a new value 0.

###model.syncConverter

The model has a `syncConverter` function that it uses to map the
incoming data values from its synchronization sources, i.e. the sources
that have been added using `bind`, `addSource`, or explicitly using
`Model.combine`. You can override this method to process the incoming
values. For instance, you may convert `undefined` values to empty
strings like this:

```js
   model.syncConverter = function(x) { return x || "" }
```

## Binding API

BJQ uses a simple `Binding` API for creating `Model` objects bound to
DOM elements. 

###Bacon.Binding(options)

Creates a new bound `Model`. The `options` argument is an object containing the following fields:

`get` : zero-arg function that returns the current value from the UI

`set` : 1-arg function that pushes the given new value to the UI

`events` : an `EventStream` of input events from the UI. The content of
these events are ignored; they are only used to trigger the polling of
the new value from the UI using the `get` function.

`initValue (optional)` : initial value to be set for the model

## Lenses 

TODO: reference to functional lenses

A lens can be defined in two ways:

### Bacon.Lens(path)

Creates a lens with a p path string, such as `"engine"` or `"engine.cylinders"`

### Bacon.Lens({get, set})

Creates a lens with a `{get, set}` pair such as `{ get: function(context) { .. }, set: function(context, value)
  { .. }}`

TODO: more

## Use with AMD / RequireJS

The [requirejs example-app](https://github.com/baconjs/bacon.jquery/tree/master/examples/requirejs) uses RequireJS, like this:

```js
require.config({
  paths: {
    "bacon.jquery": "../dist/bacon.jquery",
    "bacon": "components/bacon/dist/Bacon",
    "jquery": "components/jquery/jquery"
  }})
require(["bacon.jquery", "jquery"], function(bjq, $) {
  left = bjq.textFieldValue($("#left"))
  right = bjq.textFieldValue($("#right"))
  right.bind(left)
  right.assign($("#output"), "text")
})
```

The prebuilt javascript file can be found in the `dist` directory, or [here](https://raw.github.com/baconjs/bacon.jquery/master/dist/Bacon.JQuery.Bindings.js).

The API can be accessed using `Bacon.$` or like in the above example.

## Use without AMD

The [plain example-app](https://github.com/baconjs/bacon.jquery/tree/master/examples/plain) uses RequireJS, like this:

So feel free to use plain old `<script>` tags to include Bacon, JQuery and BJQ.

The BJQ methods are exposed through `Bacon.$`, so you can call them as in `Bacon.$.textFieldValue(..)`.

The prebuilt javascript file can be found in the `dist` directory, or [here](https://raw.github.com/baconjs/bacon.jquery/master/dist/Bacon.JQuery.Bindings.js).

There's a [plain example-app](https://github.com/baconjs/bacon.jquery/tree/master/examples/plain) that uses script tags only.

## Use with Node / Browserify

BJQ is registered in the NPM repository as `bacon.jquery` and works fine with [node-browserify](https://github.com/substack/node-browserify).

See the [browserify example-app](https://github.com/baconjs/bacon.jquery/tree/master/examples/browserify) for an example.

## Use with Bower

Registered to the Bower registry as `bacon.jquery`. See the
Example Applications, for instance [requirejs example-app](https://github.com/baconjs/bacon.jquery/tree/master/examples/requirejs).

## Building

The `bacon.jquery` module is built using NPM and Grunt.

To build, use `npm install`.

Built javascript files are under the `dist` directory.

## Automatic tests

Use the `npm test` to run all tests.

Tests include mocha tests under the `test` directory, and mocha browser tests under the `browsertest`
directory. The test script uses [mocha-phantomjs](http://metaskills.net/mocha-phantomjs/) to run the browser tests headless.

The browser tests can also be run by opening the
`browsertest/runner.html` in the browser.

The tests are also run automatically on [Travis CI](https://travis-ci.org/). See build status below.

[![Build Status](https://travis-ci.org/baconjs/bacon.jquery.png)](https://travis-ci.org/baconjs/bacon.jquery)

## What next?

See [Issues](https://github.com/baconjs/bacon.jquery/issues).

If this seems like a good idea, please tell me so! If you'd like to
contribute, please do! Pull Requests, Issues etc appreciated. Star this project to let me know that you care.
