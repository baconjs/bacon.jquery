var expect = chai.expect

describe('bacon-jquery-bindings', function() {
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
          expect(field.attr("checked")).to.equal("checked")
      })
      it('sets the initVal as the initial value of the model', function() {
        var model = Bacon.$.checkBoxValue(field, true)
        specifyValue(model, true)
      })
    })

    describe('without initVal', function() {
      it('leaves DOM unaffected', function() {
          var model = Bacon.$.checkBoxValue(field)
          expect(field.attr("checked")).to.equal(undefined)
      })
      it('uses value from DOM as initial value of the model', function() {
        var model = Bacon.$.checkBoxValue(field)
        specifyValue(model, false)
      })
    })

    describe('when setting value of model', function() {
      it('sets value to DOM', function() {
          Bacon.$.checkBoxValue(field).set(true)
          expect(field.attr("checked")).to.equal("checked")
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
  })

  describe('radioGroupValue', function() {
    var field
    beforeEach(function() {
      $('#bacon-dom').html('<label for="a">A</label><input type="radio" id="a" value="a"><br><label for="b">B</label><input type="radio" id="b" value="b" checked>')
      field = $('#a,#b')
    })

    describe('with initVal', function() {
      it('sets value to DOM', function() {
        var model = Bacon.$.radioGroupValue(field, 'a')
        expect($("#a").attr("checked")).to.equal("checked")
        expect($("#b").attr("checked")).to.equal(undefined)
      })
      it('sets the initVal as the initial value of the model', function() {
        var model = Bacon.$.radioGroupValue(field, 'a')
        specifyValue(model, 'a')
      })
    })

    describe('without initVal', function() {
      it('leaves DOM unaffected', function() {
        var model = Bacon.$.radioGroupValue(field)
        expect($("#b").attr("checked")).to.equal("checked")
        expect($("#a").attr("checked")).to.equal(undefined)
      })
      it('uses value from DOM as initial value of the model', function() {
        var model = Bacon.$.radioGroupValue(field)
        specifyValue(model, 'b')
      })
    })

    describe('when setting value of model', function() {
      it('sets value to DOM', function() {
        Bacon.$.radioGroupValue(field).set('a')
        expect($("#a").attr("checked")).to.equal("checked")
        expect($("#b").attr("checked")).to.equal(undefined)
      })
    })
  })

  describe('checkBoxGroupValue', function() {
    var field
    beforeEach(function() {
      $('#bacon-dom').html('<label for="a">A</label><input type="checkbox" id="a" value="a"><br><label for="b">B</label><input type="checkbox" id="b" value="b" checked>')
      field = $('#a,#b')
    })

    describe('with initVal', function() {
      it('sets value to DOM', function() {
        var model = Bacon.$.checkBoxGroupValue(field, ['a'])
        expect($("#a").attr("checked")).to.equal("checked")
        expect($("#b").attr("checked")).to.equal(undefined)
      })
      it('sets the initVal as the initial value of the model', function() {
        var model = Bacon.$.checkBoxGroupValue(field, ['a'])
        specifyValue(model, ['a'])
      })
    })

    describe('without initVal', function() {
      it('leaves DOM unaffected', function() {
        var model = Bacon.$.checkBoxGroupValue(field)
        expect($("#b").attr("checked")).to.equal("checked")
        expect($("#a").attr("checked")).to.equal(undefined)
      })
      it('uses value from DOM as initial value of the model', function() {
        var model = Bacon.$.checkBoxGroupValue(field)
        specifyValue(model, ['b'])
      })
    })

    describe('when setting value of model', function() {
      it('sets value to DOM', function() {
        Bacon.$.checkBoxGroupValue(field).set(['a', 'b'])
        expect($("#a").attr("checked")).to.equal("checked")
        expect($("#b").attr("checked")).to.equal("checked")
      })
    })
  })

  testEventHelper('click')
  testEventHelper('keyup')
  testEventHelper('keydown')
  testEventHelper('mouseup')

})

function testEventHelper(eventName) {
  var methodName = eventName + "E"
  describe(methodName, function() {
    it("captures DOM events as EventStream", function() {
      $('#bacon-dom').html('<input type="text" id="text">')
      var el = $('#bacon-dom #text')
      var stream = el.asEventStream("click")
      var values = collectEvents(stream)
      el.click()
      expect(values.length).to.equal(1)
    })
  })
}

function specifyValue(obs, expected) {
  var value
  obs.onValue(function(v) {
    value = v
  })
  expect(value).to.deep.equal(expected)
}

function collectEvents(observable) {
  var values = [];
  observable.onValue(function(value) {
    return values.push(value);
  });
  return values;
}
