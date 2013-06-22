require.config({
  paths: {
    "bacon-jquery-bindings": "components/bacon-jquery-bindings/dist/Bacon.JQuery.Bindings",
    "bacon": "components/bacon/dist/Bacon",
    "jquery": "components/jquery/jquery"
  }})
require(["bacon-jquery-bindings", "jquery"], function(bjq, $) {
  // binding for "left" text field
  var left = bjq.textFieldValue($("#left"))
  // binding for "right" text field
  var right = bjq.textFieldValue($("#right"))
  // make a two-way binding between these two
  right.bind(left)
  // Make a one-way side effect: update label text on changes, uppercase
  right.map(".toUpperCase").changes().assign($("#output"), "text")
  // Add an input stream for resetting the value
  left.addSource($("#reset").asEventStream("click").map(""))
})
