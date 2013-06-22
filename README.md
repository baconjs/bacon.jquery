# Bacon.JQuery.Bindings

*This library is in an experimental stage*

A JQuery data binding library for [Bacon.js](https://github.com/raimohanska/bacon.js).

Main difference to [Bacon.UI](https://github.com/raimohanska/Bacon.UI.js) 
at this point is that instead of returning a 
one-way Property, the methods in BJB return a `Binding` object that
allows you to `push` a new value explicitly to the UI using the `set`
method. You can also add
external value source using `addSource`. The `Binding` object extends
`Property` so the one-way interface hasn't changed.

## BJQ API

Currently there's just one method in the API so it's not practically
useful yet!

`bjq.textFieldValue(field [, initValue])` creates a `Binding` for a text field. 
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

## Binding API

In addition to the Bacon.js Property API, the `Binding` class has

`binding.set(value)` Sets a new value for the binding, also pushing this
value to all two-way sources.

`binding.modify(f)` Modifies the value of the binding by applying the
given function to the current value. For instance, if the current value
was `1` and you applied a `multiplyBy2` function, the value would be set
to `2`.

`binding.addSource(stream)` add an input source for pushing values to
the binding. The source may be an EventStream or a Property. The method
returns an EventStream that contains all changes from *other sources*
than this.

`binding.bind(other)` makes a two-way binding between the two bindings.

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
