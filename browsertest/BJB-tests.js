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
          var binding = Bacon.$.textFieldValue(field, 'initVal')
          expect(field.val()).to.equal('initVal')
      })
      it('sets the initVal as the initial value of the Binding', function() {
        var binding = Bacon.$.textFieldValue(field, 'initVal')
        specifyValue(binding, 'initVal')
      })
    })

    describe('without initVal', function() {
      it('leaves DOM unaffected', function() {
          var binding = Bacon.$.textFieldValue(field)
          expect(field.val()).to.equal('defaultVal')
      })
      it('uses value from DOM as initial value of the Binding', function() {
        var binding = Bacon.$.textFieldValue(field)
        specifyValue(binding, 'defaultVal')
      })
    })

    describe('when pushing value to Binding', function() {
      it('sets value to DOM', function() {
          Bacon.$.textFieldValue(field) .push('newVal')
          expect(field.val()).to.equal('newVal')
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
          var binding = Bacon.$.checkBoxValue(field, true)
          expect(field.attr("checked")).to.equal("checked")
      })
      it('sets the initVal as the initial value of the Binding', function() {
        var binding = Bacon.$.checkBoxValue(field, true)
        specifyValue(binding, true)
      })
    })

    describe('without initVal', function() {
      it('leaves DOM unaffected', function() {
          var binding = Bacon.$.checkBoxValue(field)
          expect(field.attr("checked")).to.equal(undefined)
      })
      it('uses value from DOM as initial value of the Binding', function() {
        var binding = Bacon.$.checkBoxValue(field)
        specifyValue(binding, false)
      })
    })

    describe('when pushing value to Binding', function() {
      it('sets value to DOM', function() {
          Bacon.$.checkBoxValue(field).push(true)
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
        var binding = Bacon.$.selectValue(field, 'a')
        expect(field.val()).to.equal('a')
      })
      it('sets the initVal as the initial value of the Binding', function() {
        var binding = Bacon.$.selectValue(field, 'a')
        specifyValue(binding, 'a')
      })
    })

    describe('without initVal', function() {
      it('leaves DOM unaffected', function() {
        var binding = Bacon.$.selectValue(field)
        expect(field.val()).to.equal('b')
      })
      it('uses value from DOM as initial value of the Binding', function() {
        var binding = Bacon.$.selectValue(field)
        specifyValue(binding, 'b')
      })
    })

    describe('when pushing value to Binding', function() {
      it('sets value to DOM', function() {
        Bacon.$.selectValue(field).push('a')
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
        var binding = Bacon.$.radioGroupValue(field, 'a')
        expect($("#a").attr("checked")).to.equal("checked")
        expect($("#b").attr("checked")).to.equal(undefined)
      })
      it('sets the initVal as the initial value of the Binding', function() {
        var binding = Bacon.$.radioGroupValue(field, 'a')
        specifyValue(binding, 'a')
      })
    })

    describe('without initVal', function() {
      it('leaves DOM unaffected', function() {
        var binding = Bacon.$.radioGroupValue(field)
        expect($("#b").attr("checked")).to.equal("checked")
        expect($("#a").attr("checked")).to.equal(undefined)
      })
      it('uses value from DOM as initial value of the Binding', function() {
        var binding = Bacon.$.radioGroupValue(field)
        specifyValue(binding, 'b')
      })
    })

    describe('when pushing value to Binding', function() {
      it('sets value to DOM', function() {
        Bacon.$.radioGroupValue(field).push('a')
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
        var binding = Bacon.$.checkBoxGroupValue(field, ['a'])
        expect($("#a").attr("checked")).to.equal("checked")
        expect($("#b").attr("checked")).to.equal(undefined)
      })
      it('sets the initVal as the initial value of the Binding', function() {
        var binding = Bacon.$.checkBoxGroupValue(field, ['a'])
        specifyValue(binding, ['a'])
      })
    })

    describe('without initVal', function() {
      it('leaves DOM unaffected', function() {
        var binding = Bacon.$.checkBoxGroupValue(field)
        expect($("#b").attr("checked")).to.equal("checked")
        expect($("#a").attr("checked")).to.equal(undefined)
      })
      it('uses value from DOM as initial value of the Binding', function() {
        var binding = Bacon.$.checkBoxGroupValue(field)
        specifyValue(binding, ['b'])
      })
    })

    describe('when pushing value to Binding', function() {
      it('sets value to DOM', function() {
        Bacon.$.checkBoxGroupValue(field).push(['a', 'b'])
        expect($("#a").attr("checked")).to.equal("checked")
        expect($("#b").attr("checked")).to.equal("checked")
      })
    })
  })

})

function specifyValue(binding, value) {
  binding.onValue(function(value) {
    expect(value).to.equal(value)
  })
}
