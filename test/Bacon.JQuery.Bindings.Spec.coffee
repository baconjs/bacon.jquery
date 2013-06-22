expect = require("chai").expect
Bacon = require "baconjs"
bjb = require "../src/Bacon.JQuery.Bindings"

grep = process.env.grep
if grep
  console.log("running with grep:", grep)
  origDescribe = describe
  global.describe = (desc, f) ->
    if desc.indexOf(grep) >= 0
      origDescribe(desc, f)

describe "Binding.set", ->
  it "sets new value", ->
    b = bjb.Binding()
    values = collect(b)
    b.set("wat")
    expect(values).to.deep.equal(["wat"])

describe "Binding.modify", ->
  it "modifies current value with given function", ->
    b = bjb.Binding(1)
    values = collect(b)
    b.modify((x) -> x * 2)
    b.modify((x) -> x * 2)
    expect(values).to.deep.equal([1, 2, 4])


describe "Binding.addSource", ->
  it "connects new input stream", ->
    b = bjb.Binding()
    values = collect(b)
    b.addSource(Bacon.once("wat"))
    expect(values).to.deep.equal(["wat"])
  it "returns stream of values from other sources", ->
    b = bjb.Binding()
    values = collect(b)
    otherValues = collect(b.addSource(Bacon.once("wat")))
    b.set("lol")
    expect(values).to.deep.equal(["wat", "lol"])
    expect(otherValues).to.deep.equal(["lol"])

describe "Binding.bind", ->
  it "binds two bindings 2 ways", ->
    a = bjb.Binding()
    b = bjb.Binding()
    a.bind(b)
    v_a = collect(a)
    v_b = collect(b)
    a.set("A")
    b.set("B")
    expect(v_a).to.deep.equal(["A", "B"])
    expect(v_b).to.deep.equal(["A", "B"])
  it "syncs current value when bound", ->
    a = bjb.Binding()
    a.set("X")
    b = bjb.Binding()
    b.bind(a)
    v_a = collect(a)
    v_b = collect(b)
    expect(v_a).to.deep.equal(["X"])
    expect(v_b).to.deep.equal(["X"])
  it "syncs current value when bound (when using initial from left)", ->
    a = bjb.Binding("X")
    b = bjb.Binding()
    b.bind(a)
    v_a = collect(a)
    v_b = collect(b)
    expect(v_a).to.deep.equal(["X"])
    expect(v_b).to.deep.equal(["X"])
  it "syncs current value when bound (when using initial from left)", ->
    a = bjb.Binding()
    b = bjb.Binding("X")
    b.bind(a)
    v_a = collect(a)
    v_b = collect(b)
    expect(v_a).to.deep.equal(["X"])
    expect(v_b).to.deep.equal(["X"])
  it "prefers current value from right", ->
    a = bjb.Binding("X")
    b = bjb.Binding("Y")
    b.bind(a)
    v_a = collect(a)
    v_b = collect(b)
    expect(v_a).to.deep.equal(["X"])
    expect(v_b).to.deep.equal(["X"])


collect = (binding) ->
  values = []
  binding.onValue (value) ->
    values.push(value)
  values
