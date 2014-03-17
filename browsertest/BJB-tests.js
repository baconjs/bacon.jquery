var expect = chai.expect

describe('bacon.jquery', function() {
  describe('textFieldValue', function() {
    var field
    beforeEach(function() {
      $('#bacon-dom').html('<input type="text" id="text" value="defaultVal">')
      field = $('#bacon-dom #text')
    })

    describe('with initVal', function() {
      it('sets value to DOM', function() {
          var model = Bacon.$.textFieldValue(field, 'initVal')
          expect(field.val()).to.equal('initVal')
      })
      it('sets the initVal as the initial value of the model', function() {
        var model = Bacon.$.textFieldValue(field, 'initVal')
        specifyValue(model, 'initVal')
      })
    })

    describe('without initVal', function() {
      it('leaves DOM unaffected', function() {
          var model = Bacon.$.textFieldValue(field)
          expect(field.val()).to.equal('defaultVal')
      })
      it('uses value from DOM as initial value of the model', function() {
        var model = Bacon.$.textFieldValue(field)
        specifyValue(model, 'defaultVal')
      })
      describe('with empty default value', function() {
        it('waits for browser to autofill textfield', function(done) {
          field.val('')
          var model = Bacon.$.textFieldValue(field)
          model.filter(function (v) {
              return v
          }).onValue(function() {
            specifyValue(model, 'newVal')
            done()
          })
          field.val("newVal")
        })
      })
    })

    describe('when setting value of model', function() {
      it('sets value to DOM', function() {
          Bacon.$.textFieldValue(field).set('newVal')
          expect(field.val()).to.equal('newVal')
      })
    })

    describe('when DOM value changes', function() {
      it('updates value of model', function() {
        var model = Bacon.$.textFieldValue(field)
        field.val("newVal")
        field.trigger("keyup")
        specifyValue(model, "newVal")
      })

      it('ignores duplicates', function() {
        var model = Bacon.$.textFieldValue(field)
        field.val("newVal")
        field.trigger("keyup")
        specifyValue(model, "newVal")
        var values = collectValues(model)
        field.trigger("keyup")
        field.trigger("keyup")
        expect(values).to.deep.equal(["newVal"])
      })
    })

    describe('when element is not found', function() {
      it('returns empty string as value', function() {
        var model = Bacon.$.textFieldValue($('.asdfqwer'))
        specifyValue(model, '')
      })
    })
  })

  describe('checkBoxValue', function() {
    var field
    beforeEach(function() {
      $('#bacon-dom').html('<input type="checkbox" id="checkbox">')
      field = $('#bacon-dom #checkbox')
    })

    describe('with initVal', function() {
      it('sets value to DOM', function() {
          var model = Bacon.$.checkBoxValue(field, true)
          expect(field.prop("checked")).to.equal(true)
      })
      it('sets the initVal as the initial value of the model', function() {
        var model = Bacon.$.checkBoxValue(field, true)
        specifyValue(model, true)
      })
    })

    describe('without initVal', function() {
      it('leaves DOM unaffected', function() {
          var model = Bacon.$.checkBoxValue(field)
          expect(field.prop("checked")).to.equal(false)
      })
      it('uses value from DOM as initial value of the model', function() {
        var model = Bacon.$.checkBoxValue(field)
        specifyValue(model, false)
      })
    })

    describe('when setting value of model', function() {
      it('sets value to DOM', function() {
          Bacon.$.checkBoxValue(field).set(true)
          expect(field.prop("checked")).to.equal(true)
      })
      it('leaves defaultChecked property as is', function() {
          Bacon.$.checkBoxValue(field).set(true)
          expect(field.prop("defaultChecked")).to.equal(false)
      })
    })
    describe('when DOM value changes', function() {
      it('updates value of model', function() {
        var model = Bacon.$.checkBoxValue(field)
        field.trigger("click")
        specifyValue(model, true)
      })
    })
    describe('when element is not found', function() {
      it('returns false as value', function() {
        var model = Bacon.$.checkBoxValue($('.asdfqwer'))
        specifyValue(model, false)
      })
    })
  })

  describe('selectValue', function() {
    var field
    beforeEach(function() {
      $('#bacon-dom').html('<select id="select"><option value="a">A</option><option value="b" selected>B</option></select>')
      field = $('#bacon-dom #select')
    })

    describe('with initVal', function() {
      it('sets value to DOM', function() {
        var model = Bacon.$.selectValue(field, 'a')
        expect(field.val()).to.equal('a')
      })
      it('sets the initVal as the initial value of the model', function() {
        var model = Bacon.$.selectValue(field, 'a')
        specifyValue(model, 'a')
      })
    })

    describe('without initVal', function() {
      it('leaves DOM unaffected', function() {
        var model = Bacon.$.selectValue(field)
        expect(field.val()).to.equal('b')
      })
      it('uses value from DOM as initial value of the model', function() {
        var model = Bacon.$.selectValue(field)
        specifyValue(model, 'b')
      })
    })

    describe('when setting value of model', function() {
      it('sets value to DOM', function() {
        Bacon.$.selectValue(field).set('a')
        expect(field.val()).to.equal('a')
      })
    })
    describe('when DOM value changes', function() {
      it('updates value of model', function() {
        var model = Bacon.$.selectValue(field)
        field.val("a")
        field.trigger("change")
        specifyValue(model, "a")
      })
    })
  })

  describe('selectValue without any options', function() {
    it('sets `null` as initial value of the model', function() {
      $('#bacon-dom').html('<select id="select"></select>')
      var model = Bacon.$.selectValue($('#bacon-dom #select'))
      specifyValue(model, null)
    })
  })

  describe('selectValue when element is not found', function() {
    it('sets `undefined` as initial value of the model', function() {
      var model = Bacon.$.selectValue($('.asdfqwer'))
      specifyValue(model, undefined)
    })
  })

  describe('radioGroupValue', function() {
    doTest = function(name, f) {
      function setup() {
        $('#bacon-dom').html('<label for="a">A</label><input type="radio" id="a" value="a"><br><label for="b">B</label><input type="radio" id="b" value="b" checked>')
      }
      describe("with single jQuery object", function() {
        before(setup)
        it(name, function() { f($('#a,#b')) })
      })
      describe("with array of jQuery objects", function() {
        before(setup)
        it(name, function() { f([$('#a'), $('#b')]) })
      })
    }

    describe('with initVal', function() {
      doTest('sets value to DOM', function(fields) {
        var model = Bacon.$.radioGroupValue(fields, 'a')
        expect($("#a").prop("checked")).to.equal(true)
        expect($("#b").prop("checked")).to.equal(false)
      })
      doTest('sets the initVal as the initial value of the model', function(fields) {
        var model = Bacon.$.radioGroupValue(fields, 'a')
        specifyValue(model, 'a')
      })
    })

    describe('without initVal', function() {
      doTest('leaves DOM unaffected', function(fields) {
        var model = Bacon.$.radioGroupValue(fields)
        expect($("#b").prop("checked")).to.equal(true)
        expect($("#a").prop("checked")).to.equal(false)
      })
      doTest('uses value from DOM as initial value of the model', function(fields) {
        var model = Bacon.$.radioGroupValue(fields)
        specifyValue(model, 'b')
      })
    })

    describe('when setting value of model', function() {
      doTest('sets value to DOM', function(fields) {
        Bacon.$.radioGroupValue(fields).set('a')
        expect($("#a").prop("checked")).to.equal(true)
        expect($("#b").prop("checked")).to.equal(false)
      })
      doTest('leaves defaultChecked property as is', function(fields) {
        Bacon.$.radioGroupValue(fields).set('a')
        expect($("#a").prop("defaultChecked")).to.equal(false)
        expect($("#b").prop("defaultChecked")).to.equal(true)
      })
    })

    describe('when DOM value changes', function() {
      doTest('updates value of model', function(fields) {
        var model = Bacon.$.radioGroupValue(fields)
        $("#b").click()
        $("#a").click()
        specifyValue(model, "a")
      })
    })

    describe('when elements are not found', function() {
      it('returns undefined as value', function() {
        var model = Bacon.$.radioGroupValue($(".asdfqwer"))
        specifyValue(model, undefined)
      })
    })
  })

  describe('checkBoxGroupValue', function() {
    var fields

    doTest = function(name, f) {
      function setup() {
        $('#bacon-dom').html('<label for="a">A</label><input type="checkbox" id="a" value="a"><br><label for="b">B</label><input type="checkbox" id="b" value="b" checked>')
      }
      describe("with single jQuery object", function() {
        before(setup)
        it(name, function() { f($('#a,#b')) })
      })
      describe("with array of jQuery objects", function() {
        before(setup)
        it(name, function() { f([$('#a'), $('#b')])})
      })
    }

    describe('with initVal', function() {
      doTest('sets value to DOM', function(fields) {
        var model = Bacon.$.checkBoxGroupValue(fields, ['a'])
        expect($("#a").prop("checked")).to.equal(true)
        expect($("#b").prop("checked")).to.equal(false)
      })
      doTest('sets the initVal as the initial value of the model', function(fields) {
        var model = Bacon.$.checkBoxGroupValue(fields, ['a'])
        specifyValue(model, ['a'])
      })
    })

    describe('without initVal', function() {
      doTest('leaves DOM unaffected', function(fields) {
        var model = Bacon.$.checkBoxGroupValue(fields)
        expect($("#b").prop("checked")).to.equal(true)
        expect($("#a").prop("checked")).to.equal(false)
      })
      doTest('uses value from DOM as initial value of the model', function(fields) {
        var model = Bacon.$.checkBoxGroupValue(fields)
        specifyValue(model, ['b'])
      })
    })

    describe('when setting value of model', function() {
      doTest('sets value to DOM', function(fields) {
        Bacon.$.checkBoxGroupValue(fields).set(['a', 'b'])
        expect($("#a").prop("checked")).to.equal(true)
        expect($("#b").prop("checked")).to.equal(true)
      })
      doTest('leaves defaultChecked property as is', function(fields) {
        Bacon.$.checkBoxGroupValue(fields).set(['a', 'b'])
        expect($("#a").prop("defaultChecked")).to.equal(false)
        expect($("#b").prop("defaultChecked")).to.equal(true)
      })
    })

    describe('when DOM value changes', function() {
      doTest('updates value of model', function(fields) {
        var model = Bacon.$.checkBoxGroupValue(fields)
        $("#a").trigger("click")
        specifyValue(model, ["a", "b"])
        $("#b").trigger("click")
        specifyValue(model, ["a"])
        $("#a").trigger("click")
        specifyValue(model, [])
      })
    })
    describe('when elements are not found', function() {
      it('returns [] as value', function() {
        var model = Bacon.$.checkBoxGroupValue($(".asdfqwer"))
        specifyValue(model, [])
      })
    })
  })

  testEventHelper('click')
  testEventHelper('keyup')
  testEventHelper('keydown')
  testEventHelper('mouseup')

  $.mockjax({
      url: "/test",
      responseTime: 0,
      responseText: "good"
    })

  describe("Observable.prototype.toDeferred", function(){
    it("Converts EventStream of requests into jQuery Deferred", function() {
      var dfd = Bacon.$.lazyAjax({url:"/test"}).toDeferred(),  
        cb = sinon.spy(),
        stub = sinon.stub(dfd, "done", cb)
      dfd.done(cb)
      expect(cb).to.have.been.called 
      stub.restore()
    })
  })

  describe("AJAX", function() {
    describe("Converts EventStream of requests into EventStream of responses", function() {
      expectStreamValues(Bacon.once({url:"/test"}).ajax(), ["good"])
    })
    describe("Converts Property of requests into EventStream of responses", function() {
      expectStreamValues(Bacon.once({url:"/test"}).toProperty().ajax(), ["good"])
    })
  })
})

function expectStreamValues(stream, expectedValues) {
  var values = []
  before(function(done) {
    stream.onValue(function(value) { values.push(value) })
    stream.onEnd(done)
  })
  it("is an EventStream", function() {
    expect(stream instanceof Bacon.EventStream).to.be.ok()
  })
  it("contains expected values", function() {
    expect(values).to.deep.equal(expectedValues)
  })
}

function testEventHelper(eventName) {
  var methodName = eventName + "E"
  describe(methodName, function() {
    it("captures DOM events as EventStream", function() {
      $('#bacon-dom').html('<input type="text" id="text">')
      var el = $('#bacon-dom #text')
      var stream = el[methodName]()
      var values = collectValues(stream)
      el[eventName]()
      expect(values.length).to.equal(1)
    })
  })
}

function specifyValue(obs, expected) {
  var gotIt = false
  var value
  obs.onValue(function(v) {
    gotIt = true
    value = v
  })
  expect(gotIt).to.equal(true)
  expect(value).to.deep.equal(expected)
}

function collectValues(observable) {
  var values = [];
  observable.onValue(function(value) {
    return values.push(value);
  });
  return values;
}
