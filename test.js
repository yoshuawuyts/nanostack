var tape = require('tape')
var nanobus = require('./')

tape('nanobus()', function (t) {
  t.test('should assert input statements', function (t) {
    t.plan(1)
    t.throws(nanobus.bind(null, 123), 'throws')
  })
})

tape('nanobus.from()', function (t) {
  t.test('should assert input statements', function (t) {
    t.plan(1)
    var bus = nanobus()
    t.throws(bus.from.bind(bus), 'throws')
  })
})

tape('nanobus.use()', function (t) {
  t.test('should assert input statements', function (t) {
    t.plan(1)
    var bus = nanobus()
    t.throws(bus.use.bind(bus), '.use(): throws')
  })

  t.test('should call middleware', function (t) {
    t.plan(4)
    var bus = nanobus()
    var ctx = {}

    bus.use(function (_ctx, next) {
      t.equal(_ctx, ctx, '.use(): ctx was same')
      next(null, 'hi')
    })

    bus.from(function (next) {
      t.pass('.from(): called')
      next(ctx, function (err, data) {
        t.ifError(err, '.from(): next no err')
        t.equal(data, 'hi', '.from(): next data received')
      })
    })
  })

  t.test('should allow chaining middleware', function (t) {
    t.plan(10)
    var order = 0

    var bus = nanobus()
    var ctx = {}

    bus.use(function (ctx, next) {
      t.equal(order++, 1, 'order is 1')
      next(null, function (err, val, next) {
        t.ifError(err, '.use(): next no err')
        t.equal(order++, 5, 'order is 5')
        next()
      })
    })

    bus.use(function (ctx, next) {
      t.equal(order++, 2, 'order is 2')
      next(null, function (err, val, next) {
        t.ifError(err, '.use(): next no err')
        t.equal(order++, 4, 'order is 4')
        next()
      })
    })

    bus.use(function (ctx, next) {
      t.equal(order++, 3, 'order is 3')
      next()
    })

    bus.from(function (next) {
      t.equal(order++, 0, 'order is 0')
      next(ctx, function (err, data) {
        t.ifError(err, '.from(): next no err')
        t.equal(order++, 6, 'order is 6')
      })
    })
  })
  t.test('should allow aborting middleware')
  t.test('should handle errors')
})
