var tape = require('tape')
var nanostack = require('./')

tape('nanostack()', function (t) {
  t.test('should assert input statements', function (t) {
    t.plan(1)
    var stack = nanostack()
    t.throws(stack.use.bind(stack), '.use(): throws')
  })

  t.test('should call middleware', function (t) {
    t.plan(4)
    var stack = nanostack()
    var ctx = {}

    stack.use(function (_ctx, next) {
      t.equal(_ctx, ctx, '.use(): ctx was same')
      next(null, 'hi')
    })

    t.pass('.from(): called')
    stack.from(ctx, function (err, data) {
      t.ifError(err, '.from(): next no err')
      t.equal(data, 'hi', '.from(): next data received')
    })
  })

  t.test('should allow chaining middleware', function (t) {
    t.plan(13)
    var order = 0

    var stack = nanostack()
    var ctx = {}

    stack.use(function (ctx, next) {
      t.equal(order++, 1, 'order is 1')
      next(null, function (err, val, next) {
        t.ifError(err, '.use(): next no err')
        t.equal(order++, 7, 'order is 7')
        next()
      })
    })

    stack.use(function (ctx, next) {
      t.equal(order++, 2, 'order is 2')
      next(null, function (err, val, next) {
        t.ifError(err, '.use(): next no err')
        t.equal(order++, 6, 'order is 6')
        next()
      })
    })

    stack.use(function (ctx, next) {
      t.equal(order++, 3, 'order is 3')
      next(null, function (err, val, next) {
        t.ifError(err, '.use(): next no err')
        t.equal(order++, 5, 'order is 5')
        next()
      })
    })

    stack.use(function (ctx, next) {
      t.equal(order++, 4, 'order is 4')
      next()
    })

    t.equal(order++, 0, 'order is 0')
    stack.from(ctx, function (err, data) {
      t.ifError(err, '.from(): next no err')
      t.equal(order++, 8, 'order is 8')
    })
  })

  t.test('should allow aborting middleware', function (t) {
    t.plan(4)
    var stack = nanostack()
    var ctx = {}

    stack.use(function (ctx, next) {
      t.pass('.use() was called')
      next(null, 'hi')
    })

    stack.use(function (ctx, next) {
      t.fail('should not be called')
      next()
    })

    stack.from(ctx, function (err, data) {
      t.ifError(err, 'no error')
      t.equal(data, 'hi')
      t.pass('resolved')
    })
  })

  t.test('should handle errors', function (t) {
    t.plan(2)
    var stack = nanostack()
    var ctx = {}

    stack.use(function (ctx, next) {
      next(null, function (err, val, next) {
        t.ok(err, 'err found')
        next(err)
      })
    })

    stack.use(function (ctx, next) {
      var err = new Error('mate')
      next(err)
    })

    stack.from(ctx, function (err, data) {
      t.ok(err, 'err found')
    })
  })

  t.test('should have a shared ctx', function (t) {
    t.plan(7)
    var stack = nanostack()
    var ctx = {}

    ctx.foo = 'bar'
    stack.use(function (ctx, next) {
      t.equal(ctx.foo, 'bar')
      next(null, function (err, val, next) {
        t.ifError(err, 'no err found')
        t.equal(ctx.beep, 'boop')
        next()
      })
    })

    stack.use(function (ctx, next) {
      t.equal(ctx.foo, 'bar')
      ctx.beep = 'boop'
      next()
    })

    stack.from(ctx, function (err, data) {
      t.ifError(err, 'no err found')
      t.equal(ctx.foo, 'bar', 'bar found')
      t.equal(ctx.beep, 'boop', 'boop found')
    })
  })
})
