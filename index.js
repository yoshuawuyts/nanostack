var assert = require('assert')

module.exports = Nanobus

function Nanobus () {
  if (!(this instanceof Nanobus)) return new Nanobus()
  this._middleware = []
}

Nanobus.prototype.use = function (fn) {
  assert.equal(typeof fn, 'function', 'nanobus.use: fn should be type function')
  this._middleware.push(fn)
  return this
}

Nanobus.prototype.walk = function (ctx, cb) {
  var length = this._middleware.length
  var stack = new Array(length)
  var index = 0

  assert.notEqual(length, 0, 'nanobus.from: there should be at least one middleware registered')
  assert.equal(typeof ctx, 'object', 'nanobus.from: ctx should be type object')
  assert.equal(typeof cb, 'function', 'nanobus.from: cb should be type function')

  if (cb) stack.push(cb)
  this._call(index, ctx, stack)
}

Nanobus.prototype._call = function (index, ctx, stack) {
  var middleware = this._middleware[index]
  var self = this

  middleware(ctx, function (err, val, cb) {
    if (!cb && typeof val === 'function') {
      cb = val
      val = null
    }

    // Unwind the stack if next() isn't called or there's an error
    if (err || !cb) return self._unwindStack(stack, err, val)

    // Unwind the stack if there's no next()
    stack.push(cb)
    if (index === self._middleware.length) self._unwindStack(stack)

    // Continue to next part of the stack
    index += 1
    self._call(index, ctx, stack)
  })
}

Nanobus.prototype._unwindStack = function (stack, err, val) {
  var self = this

  var fn = stack.pop()
  if (!fn) return

  fn(err, val, function (err, val) {
    self._unwindStack(stack, err, val)
  })
}
