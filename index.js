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

    self._call(index, ctx, stack)
  })
}

Nanobus.prototype._call = function (index, ctx, stack) {
  var middleware = this._middleware[index]
  var self = this

  middleware(ctx, function (err, val, cb) {
    if (!cb && typeof val === 'function') {
      cb = val
      val = null
    }

    // Unwind the stack if next() isn't called
    if (err) return self._unwindStack(stack, err)
    if (!cb) return self._unwindStack(stack, null, val)
    stack.push(cb)

    // Continue to next part of the stack
    index += 1
    assert.notEqual(index, self._middleware.length, 'nanobus.from(): no next middleware available')
    self._call(index, ctx, stack)
  })
}

Nanobus.prototype._unwindStack = function (stack, err, val) {
  var fn = stack.pop()
  var self = this
  if (!fn) return

  fn(err, val, function (err, val) {
    self._unwindStack(stack, err, val)
  })
}

Nanobus.prototype._done = function (err) {
  if (err) throw err
}
