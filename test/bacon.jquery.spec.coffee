expect = require("chai").expect
Bacon = require "baconjs"
BaconModel = require "bacon.model"
bjb = require "../src/bacon.jquery"
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
    b.set("asdf")
    expect(values).to.deep.equal(["wat", "asdf"])
  it "handles undefined like any other value", ->
    b = bjb.Model()
    values = collect(b)
    b.set("wat")
    b.set(undefined)
    expect(values).to.deep.equal(["wat", undefined])
  it "skips duplicate values", ->
    b = bjb.Model()
    values = collect(b)
    b.set("wat")
    b.set("wat")
    expect(values).to.deep.equal(["wat"])

describe "Model.get", ->
  it "returns current value", ->
    b = bjb.Model("hello")
    expect(b.get()).to.equal("hello")
    b.set("hallo")
    expect(b.get()).to.equal("hallo")
  it "defaults to undefined", ->
    b = bjb.Model()
    expect(b.get()).to.equal(undefined)

describe "Model initial value", ->
  it "is sent", ->
    cylinders = bjb.Model(12)
    expect(collect(cylinders)).to.deep.equal([12])
  it "handles undefined like any other value", ->
    cylinders = bjb.Model(undefined)
    expect(collect(cylinders)).to.deep.equal([undefined])
  it "can be omitted", ->
    cylinders = bjb.Model()
    expect(collect(cylinders)).to.deep.equal([])

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
  it "accepts initial value from a Property", ->
    b = bjb.Model()
    b.addSource(Bacon.constant("wat"))
    values = collect(b)
    expect(values).to.deep.equal(["wat"])
  it "ignores duplicates from input", ->
    b = bjb.Model()
    values = collect(b)
    b.addSource(Bacon.fromArray(["wat", "wat"]))
    expect(values).to.deep.equal(["wat"])
  it "ignores duplicates from input with init value", ->
    b = bjb.Model("wat")
    values = collect(b)
    b.addSource(Bacon.fromArray(["wat", "wat"]))
    expect(values).to.deep.equal(["wat"])

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
  it "supports syncConverter", ->
    a = bjb.Model()
    a.syncConverter = (x) -> x * 2
    b = bjb.Model(1)
    a.bind(b)
    b.set(1)
    v_a = collect(a)
    expect(v_a).to.deep.equal([2])

describe "Model.lens", ->
  engineLens = {
    get: (car) -> 
      car.engine
    set: (car, engine) ->
      car.engine = engine
      car
  }
  it "creates a lensed model", ->
    car = bjb.Model({ brand: "Ford", engine: "V8" })
    engine = car.lens engineLens
    expect(collect(engine)).to.deep.equal(["V8"])
    engine.set("V12")
    expect(collect(car)).to.deep.equal([{ brand: "Ford", engine: "V12"}])
  it "supports `modify`", ->
    model = bjb.Model({left:"left"})
    l = model.lens "left"
    expect(collect(l)).to.deep.equal(["left"])
    l.modify (e) -> e + "2"
    expect(collect(l)).to.deep.equal(["left2"])
    expect(collect(model)).to.deep.equal([{left:"left2"}])
  it "ignores changes when parent doesn't have a value yet", ->
    car = bjb.Model()
    engine = car.lens engineLens
    expect(collect(engine)).to.deep.equal([])
    engine.set("V6")
    expect(collect(car)).to.deep.equal([])
    car.set({})
    engine.set("V8")
    expect(collect(car)).to.deep.equal([{ engine: "V8" }])
  it "supports dot notation (like '.engine.cylinders')", ->
    car = bjb.Model({ brand: "Ford", engine: { cylinders: 8} })
    cylinders = car.lens ".engine.cylinders"
    expect(collect(cylinders)).to.deep.equal([8])
    cylinders.set(12)
    expect(collect(car)).to.deep.equal([{ brand: "Ford", engine: {cylinders: 12}}])
  it "Works in a more complex setup", ->
    nonNullLens = {
      get: (x) -> x||""
      set: (context, x) -> x||""
    }
    car = bjb.Model({ brand: "Ford"})
    brand = bjb.Model()
    brand.bind car.lens ".brand"
    nonNullBrand = brand.lens nonNullLens
    brandValues = collect(nonNullBrand)
    car.set {}
    expect(brandValues).to.deep.equal ["Ford", ""]
  it "works in diamond-shaped setup", ->
    root = Bacon.Model()
    first = root.lens("first")
    last = root.lens("last")
    stuff = Bacon.Model.combine({first, last})
    values = collect(stuff)
    root.set({first:"f", last:"l"})
    expect(values).to.deep.equal([
      {}, 
      {first: "f"},
      {first: "f", last: "l"}])

describe "Model.combine", ->
  it "creates a new model using a template", ->
    cylinders = bjb.Model(12)
    doors = bjb.Model(2)
    car = bjb.Model.combine {
      price: "expensive",
      engine: { type: "gas", cylinders},
      doors
    }
    expect(collect(car)).to.deep.equal([{
      price: "expensive",
      engine: { type: "gas", cylinders: 12 },
      doors: 2
    }])
    car.lens("engine").set({ cylinders: 8, type: "gas" })
    expect(collect(car)).to.deep.equal([{
      price: "expensive",
      engine: { type: "gas", cylinders: 8 },
      doors: 2
    }])
    expect(collect(cylinders)).to.deep.equal([8])
  it "supports deep nesting", ->
    cylinders = bjb.Model(12)
    seats = bjb.Model(4)
    car = bjb.Model.combine {
      engine: { cylinders},
      interior: {
        seats: { count: seats }
      }
    }
    seats.set(5)
    expect(collect(cylinders)).to.deep.equal([12])
    expect(collect(car)).to.deep.equal([{
      engine: { cylinders: 12 }
      interior: {
        seats: {
          count: 5
        }
      }
    }])
  it "skips duplicates correctly", ->
    a = bjb.Model("a")
    b = bjb.Model("b")
    c = bjb.Model.combine { a, b }
    values = collect(c)
    a.set("a2")
    a.set("a2")
    expect(values).to.deep.equal([
      { a: "a", b: "b" },
      { a: "a2", b: "b" }])
  it "skips duplicates correctly with external source", ->
    a = bjb.Model("a")
    b = bjb.Model("b")
    c = bjb.Model.combine { a, b }
    values = collect(c)
    bus = new Bacon.Bus()
    a.addSource(bus)
    bus.push("a2")
    bus.push("a2")
    expect(values).to.deep.equal([
      { a: "a", b: "b" },
      { a: "a2", b: "b" }])

collect = (observable) ->
  values = []
  observable.onValue (value) ->
    values.push(value)
  values
