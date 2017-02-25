var assert = require('assert')

module.exports = Nanobus

function Nanobus (opts) {
  if (!(this instanceof Nanobus)) return new Nanobus(opts)
  opts = opts || {}
  assert.equal(typeof opts, 'object', 'nanobus: opts should be type object')
  this._middleware = []
}

Nanobus.prototype.use = function (fn) {
  assert.equal(typeof fn, 'function', 'nanobus.use: fn should be type function')
  this._middleware.push(fn)
  return this
}

Nanobus.prototype.from = function (fn) {
  assert.equal(typeof fn, 'function', 'nanobus.from: fn should be type function')

  var self = this

  fn(function (ctx, cb) {
    var stack = new Array(self._middleware.length)
    var index = 0

    stack.push(self._done)
    if (cb) stack.push(cb)

    call(index, ctx, stack)
  })

  function call (index, ctx, stack) {
    var middleware = self._middleware[index]

    middleware(ctx, function (err, val, cb) {
      if (!cb && typeof val === 'function') {
        cb = val
        val = null
      }

      // Unwind the stack if next() isn't called
      if (err) return unwindStack(stack, err)
      if (!cb) return unwindStack(stack, null, val)
      stack.push(cb)

      // Continue to next part of the stack
      index += 1
      assert.notEqual(index, self._middleware.length, 'nanobus.from(): no next middleware available')
      call(index, ctx, stack)
    })
  }

  function unwindStack (stack, err, val) {
    var fn = stack.pop()
    if (!fn) return

    fn(err, val, function (err, val) {
      unwindStack(stack, err, val)
    })
  }
}

Nanobus.prototype._done = function (err) {
  if (err) throw err
}
