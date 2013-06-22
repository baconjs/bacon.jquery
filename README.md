# Bacon.JQuery.Bindings (BJQ)

*This library is in an experimental stage*

A JQuery data binding library for [Bacon.js](https://github.com/raimohanska/bacon.js).

Main difference to [Bacon.UI](https://github.com/raimohanska/Bacon.UI.js) 
at this point is that instead of returning a 
one-way Property, the methods in BJB return a `Model` object that
allows you to `push` a new value explicitly to the UI using the `set`
method. You can also add
external value source using `addSource`. The `Model` object extends
`Property` so the one-way interface hasn't changed.

## BJQ API

TODO: update this section, as there's more than one method there!

Currently there's just one method in the API so it's not practically
useful yet!

`bjq.textFieldValue(field [, initValue])` creates a `Model` for a text field. 
You can optionally supply an initial value.

Example:

```js
  // binding for "left" text field
  left = bjq.textFieldValue($("#left"))
  // binding for "right" text field
  right = bjq.textFieldValue($("#right"))
  // make a two-way binding between these two
  right.bind(left)
  // Make a one-way side effect: update label text on changes, uppercase
  right.map(".toUpperCase").changes().assign($("#output"), "text")
  // Add an input stream for resetting the value
  left.addSource($("#reset").asEventStream("click").map(""))
```

## Model API

All the BJB methods, such as `textFieldValue` return a `Model` object, which is a Bacon.js `Property`, but extends that API by the following methods.

`model.set(value)` Sets a new value for the model, also pushing this
value to all two-way sources.

`model.modify(f)` Modifies the value of the model by applying the
given function to the current value. For instance, if the current value
was `1` and you applied a `multiplyBy2` function, the value would be set
to `2`.

`model.addSource(stream)` add an input source for pushing values to
the model. The source may be an EventStream or a Property. The method
returns an EventStream that contains all changes from *other sources*
than this.

`model.apply(stream)` add an input source for modifications to the model. The source may be an EventStream or a Property, and is supposed to contain functions as values. Each of these functions are applied as modifications to the value of the model (as with using the `modify` method). The method returns an EventStream that contains all changes from *other sources* than this.

`model.bind(other)` makes a two-way binding between the two models.

`Bacon.Model(initValue)` creates a new model, with the given (optional)
initial value.

## Binding API

BJB uses a simple `Binding` API for creating `Model` objects bound to
DOM elements. `Bacon.Binding(options)` creates a new bound `Model`. The options
is an object containing the following fields:

`get` : zero-arg function that returns the current value from the UI

`set` : 1-arg function that pushes the given new value to the UI

`events` : an `EventStream` of input events from the UI. The content of
these events are ignored; they are only used to trigger the polling of
the new value from the UI using the `get` function.

`initValue (optional)` : initial value to be set for the model

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

## Example Applications

There are example applications in the [examples](https://github.com/raimohanska/bacon-jquery-bindings/tree/master/examples) directory. Both use Bower to download dependencies (including BJB). Here's how to start one of them:

    npm install -g bower
    cd examples/requirejs
    bower install
    open index.html

.. the last line being OSX specific. Anyway, you need to run `bower
install` to download deps, and then open `index.html`.

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
