# Bacon.JQuery.Bindings

*This library is in an experimental stage*

A JQuery data binding library for [Bacon.js](https://github.com/raimohanska/bacon.js).

Main difference to [Bacon.UI](https://github.com/raimohanska/Bacon.UI.js) 
at this point is that instead of returning a 
one-way Property, the methods in BJB return a `Binding` object that
allows you to `push` a new value explicitly to the UI. You can also add
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

`binding.push(value)` forces a new value for the binding, pushing this
value to all two-way sources.

`binding.addSource(stream)` add an input source for pushing values to
the binding. The source may be an EventStream or a Property. The method
returns an EventStream that contains all changes from *other sources*
than this.

`binding.bind(other)` makes a two-way binding between the two bindings.

## Use with AMD

The [example-app](https://github.com/raimohanska/bacon-jquery-bindings/tree/master/example-app) uses RequireJS, like this:

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

## Example Application

There will be an example application under the [example-app](https://github.com/raimohanska/bacon-jquery-bindings/tree/master/example-app) directory.

Actually there's something already.

    npm install -g bower
    cd example-app
    bower install
    cd -
    python -m SimpleHTTPServer

Example app will appear to http://localhost:8000/example-app/

## Building

The module is build using Grunt. The easiest way to build is, however,
to run the `build` script. 

Built javascript files are under the `dist` directory.

## Automatic tests

Use the `run-tests` script to run all tests.

Tests include mocha tests under the `test` directory (currently just a
placeholder test), and mocha browser tests under the `browsertest`
directory. The test script uses [mocha-phantomjs](http://metaskills.net/mocha-phantomjs/) to run the browser tests headless.

The browser tests can also be run by opening the
`browsertest/runner.html` in the browser.

## What next?

- Proper tests for textFieldValue
- Catch up with Bacon.UI (but this time there have to be tests for all
  methods!)

If this seems like a good idea, please tell me so! If you'd like to
contribute, please do!
