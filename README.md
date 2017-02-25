# nanostack [![stability][0]][1]
[![npm version][2]][3] [![build status][4]][5] [![test coverage][6]][7]
[![downloads][8]][9] [![js-standard-style][10]][11]

Small middleware stack library. Analogous to [co][co] but without relying on
fancy language features. Weighs `~0.4kb` gzipped.

## Usage
```js
var nanostack = require('nanostack')
var stack = nanostack()

stack.push(function timeElapsed (ctx, next) {
  var start = Date.now()

  next(null, function (err, ctx, next) {
    if (err) return next(err)
    var now = Date.now()
    var elapsed = start - now
    console.log('time elapsed: ' + elapsed + 'ms')
    next()
  })
})

var ctx = {}
stack.walk(ctx, function (err, data, next) {
  if (err) throw err
})
```

## How does this work?
A stack is a "last-in, first-out" type structure. The last thing that's added
is also the first thing that's taken off when you "unwind the stack".

In `nanostack` we push middleware onto the stack. This means that middleware is
first executed _upwards_ (e.g. next function in sequence) until `next()` is
called without a callback. When that happens the stack starts to unwind, and
middleware is executed _downwards_. You can think of the execution order like
this:

```txt
  Nanostack
1.          7.  Middleware 1
==============
2.          6.  Middleware 2
==============
3.          5.  Middleware 3
==============
      4.        Middleware 4
```
```txt
Sequence: middleware 1, middleware 2, middleware 3
          middleware 4, middleware 3, middleware 2
          middleware 1
```
A keyd thing to note here is that any part of middleware can cause the stack to
unwind. This is done by not passing a callback into the `next()` function. This
is for example useful to handle create generic error handlers for the whole
stack of middleware.

## API
### `stack = nanostack`
Create a new `nanostack` instance.

### `stack.push(cb(ctx, next))`
Push a new handler onto the middleware stack.

### `stack.walk(ctx, next)`
Call the functions on the middleware stack. Takes an initial context object and
a callback.

### `next([err], [value], [handler])`
Call the next function in the stack. If `handler` is not passed (e.g. last
argument is not a function) the stack unwinds, calling all previous `handler`
functions in reverse order (e.g. as a stack).

## FAQ
### Why did you write this?
I realized that most frontend and backend plugin systems / middleware is often
best expressed as a stack that can execute some code at the start, handing off
control to a function up the stack and then execute some more code when it
regains control (before handing control off again down the stack).

`co` figured this out a while ago, but relying on newer language features
prevented it from being generally applicable (for me). This package takes the
same ideas and allows them to run in more environments.

### When shouldn't I use this?
This package is probably best left for frameworks to consume / when doing more
complex-ish architecture things. Generally the last handler on the stack would
be a message bus / router that enables multiple handlers to resolve. If you're
building something simple that might be all you need actually. Or if you want
to get fancy you might want to consider using a package that consumes this one
and exposes a neato pattern on top.

## Similar Packages
- [tj/co][co]

## License
[MIT](https://tldrlegal.com/license/mit-license)

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/nanostack.svg?style=flat-square
[3]: https://npmjs.org/package/nanostack
[4]: https://img.shields.io/travis/yoshuawuyts/nanostack/master.svg?style=flat-square
[5]: https://travis-ci.org/yoshuawuyts/nanostack
[6]: https://img.shields.io/codecov/c/github/yoshuawuyts/nanostack/master.svg?style=flat-square
[7]: https://codecov.io/github/yoshuawuyts/nanostack
[8]: http://img.shields.io/npm/dm/nanostack.svg?style=flat-square
[9]: https://npmjs.org/package/nanostack
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard
[co]: https://github.com/tj/co
