# Bacon.JQuery.Bindings

*This library is in an experimental stage*

A JQuery data binding library for Bacon.js.

Main difference to Bacon.UI at this point is that instead of returning a 
one-way Property, the methods in BJB return a `Binding` object that
allows you to `push` a new value explicitly to the UI. You can also add
external value source using `addSource`. The Binding object extends
Property so the one-way interface hasn't changed.

## BJQ API

`bjq.textFieldValue(field [, initValue])` binding for a text field

## Binding API

In addition to the Bacon.js Property API, the `Binding` class has

`binding.push(value)` force a new value for the binding

`binding.addSource(stream)` add an input source for pushing values to
the binding. The source may be an EventStream or a Property.

`binding.bind(other)` make a two-way binding between the two bindings.

## Building

The module is build using Grunt. The easiest way to build is, however,
to run the `build` script.

Build javascript files are under the `dist` directory.

## Example Application

There will be an example application under the `example-app` directory.

    cd example-app
    bower install
    cd -
    python -m SimpleHTTPServer

Example app will appear to http://localhost:8000/example-app/
