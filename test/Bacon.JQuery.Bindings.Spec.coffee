`import {expect} from "chai"`
`import Bacon from "baconjs"`
`import bjb from "./bacon.jquery"`

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

describe "Model initial value", ->
  it "is sent", ->
    cylinders = bjb.Model(12)
    expect(collect(cylinders)).to.deep.equal([12])
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

collect = (observable) ->
  values = []
  observable.onValue (value) ->
    values.push(value)
  values
