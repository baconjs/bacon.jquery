expect = require("chai").expect
Bacon = require "baconjs"
bjb = require "../src/Bacon.JQuery.Bindings"
twice = (x) -> x * 2

grep = process.env.grep
if grep
  console.log("running with grep:", grep)
  origDescribe = describe
  global.describe = (desc, f) ->
    if desc.indexOf(grep) >= 0
      origDescribe(desc, f)

describe "Model.set", ->
  it "sets new value", ->
    b = bjb.Model()
    values = collect(b)
    b.set("wat")
    expect(values).to.deep.equal(["wat"])

describe "Model.modify", ->
  it "modifies current value with given function", ->
    b = bjb.Model(1)
    values = collect(b)
    b.modify(twice)
    b.modify(twice)
    expect(values).to.deep.equal([1, 2, 4])

describe "Model.apply", ->
  it "Applies given stream of functions to the Model", ->
    b = bjb.Model(1)
    values = collect(b)
    b.apply(Bacon.fromArray([twice, twice, twice]))
    expect(values).to.deep.equal([1, 2, 4, 8])

describe "Model.addSource", ->
  it "connects new input stream", ->
    b = bjb.Model()
    values = collect(b)
    b.addSource(Bacon.once("wat"))
    expect(values).to.deep.equal(["wat"])
  it "returns stream of values from other sources", ->
    b = bjb.Model()
    values = collect(b)
    otherValues = collect(b.addSource(Bacon.once("wat")))
    b.set("lol")
    expect(values).to.deep.equal(["wat", "lol"])
    expect(otherValues).to.deep.equal(["lol"])

describe "Model.bind", ->
  it "binds two bindings 2 ways", ->
    a = bjb.Model()
    b = bjb.Model()
    a.bind(b)
    v_a = collect(a)
    v_b = collect(b)
    a.set("A")
    b.set("B")
    expect(v_a).to.deep.equal(["A", "B"])
    expect(v_b).to.deep.equal(["A", "B"])
  it "syncs current value when bound", ->
    a = bjb.Model()
    a.set("X")
    b = bjb.Model()
    b.bind(a)
    v_a = collect(a)
    v_b = collect(b)
    expect(v_a).to.deep.equal(["X"])
    expect(v_b).to.deep.equal(["X"])
  it "syncs current value when bound (when using initial from left)", ->
    a = bjb.Model("X")
    b = bjb.Model()
    b.bind(a)
    v_a = collect(a)
    v_b = collect(b)
    expect(v_a).to.deep.equal(["X"])
    expect(v_b).to.deep.equal(["X"])
  it "syncs current value when bound (when using initial from left)", ->
    a = bjb.Model()
    b = bjb.Model("X")
    b.bind(a)
    v_a = collect(a)
    v_b = collect(b)
    expect(v_a).to.deep.equal(["X"])
    expect(v_b).to.deep.equal(["X"])
  it "prefers current value from right", ->
    a = bjb.Model("X")
    b = bjb.Model("Y")
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
