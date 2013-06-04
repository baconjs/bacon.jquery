# Bacon.JQuery.Bindings

*This library is in an experimental stage*

A JQuery data binding library for [Bacon.js](https://github.com/raimohanska/bacon.js).

Main difference to [Bacon.UI](https://github.com/raimohanska/Bacon.UI.js) 
at this point is that instead of returning a 
one-way Property, the methods in BJB return a `Binding` object that
allows you to `push` a new value explicitly to the UI. You can also add
external value source using `addSource`. The `Binding` object extends
`Property` so the one-way interface hasn't changed.

Currently there's just one method in the API so it's not practically
useful yet!

## BJQ API

`bjq.textFieldValue(field [, initValue])` binding for a text field

## Binding API

In addition to the Bacon.js Property API, the `Binding` class has

`binding.push(value)` forces a new value for the binding, pushing this
value to all two-way sources.

`binding.addSource(stream)` add an input source for pushing values to
the binding. The source may be an EventStream or a Property. The method
returns an EventStream that contains all changes from *other sources*
than this.

`binding.bind(other)` makes a two-way binding between the two bindings.

## Building

The module is build using Grunt. The easiest way to build is, however,
to run the `build` script. Before that you need to run `npm install -g
grunt` though.

Build javascript files are under the `dist` directory.

## Example Application

There will be an example application under the [example-app](https://github.com/raimohanska/bacon-jquery-bindings/tree/master/example-app) directory.

Actually there's something already.

    npm install -g bower
    cd example-app
    bower install
    cd -
    python -m SimpleHTTPServer

Example app will appear to http://localhost:8000/example-app/
