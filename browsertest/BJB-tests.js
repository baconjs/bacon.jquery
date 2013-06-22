var expect = chai.expect

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

function specifyValue(binding, value) {
  binding.onValue(function(value) {
    expect(value).to.equal(value)
  })
}
