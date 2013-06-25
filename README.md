# Bacon.JQuery.Bindings (BJQ)

*This library is in an experimental stage*

A JQuery data binding library for [Bacon.js](https://github.com/raimohanska/bacon.js).

Main difference to [Bacon.UI](https://github.com/raimohanska/Bacon.UI.js) 
at this point is that instead of returning a 
one-way Property, the methods in BJB return a `Model` object that
allows you to `set` a new value explicitly to the UI using the `set`
method. You can also add
external value source using `addSource`. The `Model` object extends
`Property` so the one-way interface hasn't changed.

## Example Applications

There are example applications in the [examples](https://github.com/raimohanska/bacon-jquery-bindings/tree/master/examples) directory, each with a README.md describing how they are started.

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

## BJQ API

The BJQ API consists of methods for creating a `Model` representing the
state of a DOM element or a group of DOM elements.

###bjq.textFieldValue(field [, initValue])

Creates a `Model` for an
`<input type="text">` element, given as a JQuery object. You can optionally supply an initial value.

###bjq.checkBoxValue(field [, initValue])

Creates a `Model` for a
`<input type="checkbox">` element, given as a JQuery object. The value is `true` if the checkbox is checked and
`false` otherwise.

###bjq.selectValue(field [,initValue])

Creates a `Model` for a `<select>`
element, given as a JQuery object. The value of the model corresponds to the `value` attribute of the selected `<option>` element.

###bjq.radioGroupValue(fields, [,initValue])

Creates a `Model` for a
group of `<input type="radio">` elements, given as a JQuery object. The value
of the model corresponds to the `value` attribute of the selected radio
input element.

###bjq.checkBoxGroupValue(fields, [,initValue])

Creates a `Model` for a group
of `<input type="checkbox">` elements, given as a JQuery object. The value
of the model is an array of the `value` attributes of the checked
checkbox input elements. For instance, if you have checkboxes and 2 of
these are checked, having values `a` and `b`, the value of the Model is
`["a", "b"]`.

TODO: add HTML/JS examples

## Model API

All the BJB methods, such as `textFieldValue` return a `Model` object, which is a Bacon.js `Property`, but extends that API by the following methods.

###Bacon.Model(initValue)

Creates a new model, with the given (optional) initial value.

###model.set(value)

Sets a new value for the model, also pushing this
value to all two-way sources.

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
    car = bjb.Model({ brand: "Ford", engine: "V8" })
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
    cylinders = bjb.Model(12)
    // Model for the number of doors
    doors = bjb.Model(2)
    // Composite model for the whole car
    car = bjb.Model.combine {
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

## Binding API

BJB uses a simple `Binding` API for creating `Model` objects bound to
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

## Use with AMD

The [requirejs example-app](https://github.com/raimohanska/bacon-jquery-bindings/tree/master/examples/requirejs) uses RequireJS, like this:

```js
require.config({
  paths: {
    "bacon-jquery-bindings": "../dist/Bacon.JQuery.Bindings",
    "bacon": "components/bacon/dist/Bacon",
    "jquery": "components/jquery/jquery"
  }})
require(["bacon-jquery-bindings", "jquery"], function(bjq, $) {
  left = bjq.textFieldValue($("#left"))
  right = bjq.textFieldValue($("#right"))
  right.bind(left)
  right.assign($("#output"), "text")
})
```

The prebuilt javascript file can be found in the `dist` directory, or [here](https://raw.github.com/raimohanska/bacon-jquery-bindings/master/dist/Bacon.JQuery.Bindings.js).

## Use without AMD

Works without AMD too, so feel free to use plain old `<script>` tags to include Bacon, JQuery and BJQ.

The BJQ methods are exposed through `Bacon.$`, so you can call them as in `Bacon.$.textFieldValue(..)`.

The prebuilt javascript file can be found in the `dist` directory, or [here](https://raw.github.com/raimohanska/bacon-jquery-bindings/master/dist/Bacon.JQuery.Bindings.js).

There's a [plain example-app](https://github.com/raimohanska/bacon-jquery-bindings/tree/master/examples/plain) that uses script tags only.

## Use with Node

Haven't published this to NPM yet, but will do. The idea is to keep this compatible with the Node environment too. Not sure if it makes any sense though.

## Use with Bower

Registered to the Bower registry as `bacon-jquery-bindings`. See the
Example Applications, for instance [requirejs example-app](https://github.com/raimohanska/bacon-jquery-bindings/tree/master/examples/requirejs).

## Building

The BJB module is build using Grunt. The easiest way to build is, however,
to run the `build` script.

Built javascript files are under the `dist` directory.

## Automatic tests

Use the `npm test` to run all tests.

Tests include mocha tests under the `test` directory (currently just a
placeholder test), and mocha browser tests under the `browsertest`
directory. The test script uses [mocha-phantomjs](http://metaskills.net/mocha-phantomjs/) to run the browser tests headless.

The browser tests can also be run by opening the
`browsertest/runner.html` in the browser.

The tests are also run automatically on [Travis CI](https://travis-ci.org/). See build status below.

[![Build Status](https://travis-ci.org/raimohanska/bacon-jquery-bindings.png)](https://travis-ci.org/raimohanska/bacon-jquery-bindings)

## What next?

See [Issues](https://github.com/raimohanska/bacon-jquery-bindings/issues).

If this seems like a good idea, please tell me so! If you'd like to
contribute, please do! Pull Requests, Issues etc appreciated. Star this project to let me know that you care.
