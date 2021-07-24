// promise A+ standard
const PENDING = 'pending';
const RESOLVED = 'fulfilled';
const REJECTED = 'rejected';

function MyPromise(executor) {
  let state = PENDING;

  // 1.3 “eventualValue” is any legal JavaScript value
  // (including undefined, a thenable, or a promise).
  let eventualValue;

  // 2.2.6 then may be called multiple times on the same promise.
  // 2.2.6.1 If/when promise is fulfilled,
  // all respective onFulfilled callbacks must execute in the order of their originating calls to then.
  let resolveCallbacks = [];
  // 2.2.6.2 If/when promise is rejected,
  // all respective onRejected callbacks must execute in the order of their originating calls to then.
  let rejectCallbacks = [];

  Object.defineProperties(this, {
    state: {
      get() { return state; },
      set(otherState) {
        // 2.1.2 When fulfilled, a promise:
        // 2.1.2.1 must not transition to any other state.
        if (state === RESOLVED) return;
        // 2.1.3 When rejected, a promise:
        // 2.1.3.1 must not transition to any other state.
        if (state === REJECTED) return;
        // 2.1.1 When pending, a promise:
        // 2.1.1.1 may transition to either the fulfilled or rejected state.
        state = otherState;
      }
    },
    eventualValue: {
      get() { return eventualValue; },
      set(value) {
        // 2.1.2 When fulfilled, a promise:
        // 2.1.2.2 must have a value, which must not change.
        if (state === RESOLVED) return;
        // 2.1.3 When rejected, a promise:
        // 2.1.3.2 must have a reason, which must not change.
        if (state === REJECTED) return;
        eventualValue = value;
      }
    },
    resolveCallbacks: {
      get() { return resolveCallbacks; }
    },
    rejectCallbacks: {
      get() { return rejectCallbacks; }
    }
  });

  const resolve = (value) => setTimeout(() => {
    if (this.state !== PENDING) return;
    this.eventualValue = value;
    this.state = RESOLVED;
    this.resolveCallbacks.forEach(cb => cb(value));
  });
  // 1.5 “reason” is a value that indicates why a promise was rejected.
  const reject = (reason) => setTimeout(() => {
    if (this.state !== PENDING) return;
    this.eventualValue = reason;
    console.error(new Error('MyPromise error:' + (reason?.stack ?? reason?.toString?.())));
    this.state = REJECTED;
    this.rejectCallbacks.forEach(cb => cb(reason));
  })
  try {
    executor(resolve, reject);
  }
  // 1.4 “exception” is a value that is thrown using the throw statement.
  catch (exception) {
    reject(exception);
  }
}

// 2.2.7.1 If either onFulfilled or onRejected returns a value x,
// run the Promise Resolution Procedure [[Resolve]](promise2, x).
function resolutionProcedure(promise2, x, resolve, reject) {
  // 2.3.1 If promise and x refer to the same object,
  //reject promise with a TypeError as the reason.
  if (x === promise2) reject(new TypeError('Can not return promise2.'))
  // 2.3.2 If x is a promise, adopt its state [3.4]:
  if (x instanceof MyPromise) {
    // 2.3.2.1 If x is pending, promise must remain pending until x is fulfilled or rejected.
    x.then((value) => {
      // 2.3.2.2 If/when x is fulfilled, fulfill promise with the same value.
      // 2.3.2.3 If/when x is rejected, reject promise with the same reason.
      resolutionProcedure(promise2, value, resolve, reject);
    }, reject);
  }
  // 2.3.3 Otherwise, if x is an object or function,
  else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    // 2.3.3.1 Let then be x.then. [3.5]
    // 2.3.3.2 If retrieving the property x.then results in a thrown exception e,
    // reject promise with e as the reason.
    const then = x.then;
    // 2.3.3.3 If then is a function, call it with x as this,
    // first argument resolvePromise, and second argument rejectPromise, where:
    if (typeof then === 'function') {
      // 2.3.3.3.3 If both resolvePromise and rejectPromise are called,
      // or multiple calls to the same argument are made,
      // the first call takes precedence, and any further calls are ignored.
      let called = false;
      try {
        then.call(
          x,
          // 2.3.3.3.1 If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
          (y) => {
            if (called) return;
            called = true;
            resolutionProcedure(promise2, y, resolve, reject);
          },
          // 2.3.3.3.2 If/when rejectPromise is called with a reason r, reject promise with r.
          (r) => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      }
      // 2.3.3.3.4 If calling then throws an exception e,
      catch (e) {
        // 2.3.3.3.4.1 If resolvePromise or rejectPromise have been called, ignore it.
        if (called) return;
        // 2.3.3.3.4.2 Otherwise, reject promise with e as the reason.
        reject(e);
      }
    }
    // 2.3.3.4 If then is not a function, fulfill promise with x.
    else resolve(x);
  }
  // 2.3.4 If x is not an object or function, fulfill promise with x.
  else resolve(x);
};

// 1.1 “promise” is an object or function with a then method
//     whose behavior conforms to this specification.
MyPromise.prototype.then = function (onFulfilled, onRejected) {
  // 2.2.1 Both onFulfilled and onRejected are optional arguments:
  // 2.2.1.1 If onFulfilled is not a function, it must be ignored.
  // 2.2.7.3 If onFulfilled is not a function and promise1 is fulfilled,
  // promise2 must be fulfilled with the same value as promise1
  const ignoredFulfilled = (v) => v;
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : ignoredFulfilled;
  // 2.2.1.2 If onRejected is not a function, it must be ignored.
  // 2.2.7.4 If onRejected is not a function and promise1 is rejected,
  // promise2 must be rejected with the same reason as promise1.
  const ignoredRejected = (r) => { throw r; };
  onRejected = typeof onRejected === 'function' ? onRejected : ignoredRejected;
  // 2.2.7 then must return a promise [3.3].
  const promise2 = new MyPromise((resolve, reject) => {
    // 2.2.2 If onFulfilled is a function:
    const executeOnFulFilled = () => {
      // 2.2.2.1 it must be called after promise is fulfilled,
      // with promise’s value as its first argument.
      // 2.2.2.2 it must not be called before promise is fulfilled.
      // 2.2.2.3 it must not be called more than once.
      if (this.state === RESOLVED) {
        try {
          // 2.2.5 onFulfilled and onRejected must be called as functions
          // (i.e. with no this value).
          const x = onFulfilled(this.eventualValue);
          // 2.2.7.1 If either onFulfilled or onRejected returns a value x,
          // run the Promise Resolution Procedure [[Resolve]](promise2, x).
          resolutionProcedure(promise2, x, resolve, reject);
        }
        // 2.2.7.2 If either onFulfilled or onRejected throws an exception e,
        // promise2 must be rejected with e as the reason.
        catch (e) { reject(e); }
      }
    };
    // 2.2.3 If onRejected is a function,
    const executeOnRejected = () => {
      // 2.2.3.1 it must be called after promise is rejected,
      // with promise’s reason as its first argument.
      // 2.2.3.2 it must not be called before promise is rejected.
      // 2.2.2.3 it must not be called more than once.
      if (this.state === REJECTED) {
        try {
          // 2.2.5 onFulfilled and onRejected must be called as functions
          // (i.e. with no this value).
          const x = onRejected(this.eventualValue);
          // 2.2.7.1 If either onFulfilled or onRejected returns a value x,
          // run the Promise Resolution Procedure [[Resolve]](promise2, x).
          resolutionProcedure(promise2, x, resolve, reject);
        }
        // 2.2.7.2 If either onFulfilled or onRejected throws an exception e,
        // promise2 must be rejected with e as the reason.
        catch (e) { reject(e); }
      }
    };
    if (this.state === RESOLVED) {
      // 2.2.4 onFulfilled or onRejected must not be called
      // until the execution context stack contains only platform code. [3.1].
      setTimeout(executeOnFulFilled);
    } else if (this.state === REJECTED) {
      // 2.2.4 onFulfilled or onRejected must not be called
      // until the execution context stack contains only platform code. [3.1].
      setTimeout(executeOnRejected);
    } else if (this.state === PENDING) {
      this.resolveCallbacks.push(executeOnFulFilled);
      this.rejectCallbacks.push(executeOnRejected);
    }
  });
  return promise2;
};

MyPromise.resolve = function (value) {
  if (value instanceof MyPromise) return value;
  const promise2 = new MyPromise((resolve, reject) => {
    setTimeout(() => resolutionProcedure(promise2, value, resolve, reject))
  });
  return promise2;
};

MyPromise.reject = function (reason) {
  const executor = (resolve, reject) => reject(reason);
  return new MyPromise(executor);
};

MyPromise.all = function (iterable) {
  return new MyPromise((resolve, reject) => {
    const promiseArray = Array.from(iterable);
    const length = promiseArray.length;
    const results = [];
    let count = 0;

    if (length === 0) resolve(results);
    for (let i = 0; i < length; i++) {
      const value = promiseArray[i];
      MyPromise.resolve(value).then((v) => {
        count++;
        results[i] = v;
        if (count === length) resolve(results);
      }, reject)
    }
  })
};

MyPromise.race = function (iterable) {
  return new MyPromise((resolve, reject) => {
    const promiseArray = Array.from(iterable);
    const nonPromiseArray = promiseArray.filter(v => (
      !(v instanceof MyPromise) || v.state !== PENDING
    ));
    if (nonPromiseArray.length > 0) {
      MyPromise.resolve(nonPromiseArray[0]).then(resolve, reject);
      return;
    };
    const length = promiseArray.length;
    for (let i = 0; i < length; i++) {
      const value = promiseArray[i];
      MyPromise.resolve(value).then(resolve, reject)
    }
  });
};

MyPromise.allSettled = function (iterable) {
  return new MyPromise((resolve) => {
    const promiseArray = Array.from(iterable);
    const length = promiseArray.length;
    if (length === 0) resolve(promiseArray);
    const results = [];
    let count = 0;
    for (let i = 0; i < length; i++) {
      const value = promiseArray[i];
      MyPromise.resolve(value)
        .then((v) => {
          count++;
          results[i] = {
            status: RESOLVED,
            value: v
          };
          if (count === length) resolve(results);
        })
        .catch((r) => {
          count++;
          results[i] = {
            status: REJECTED,
            reason: r
          };
          if (count === length) resolve(results);
        });
    }
  });
};

MyPromise.prototype.catch = function (onRejected) {
  const ignoredRejected = (r) => { throw r; };
  onRejected = typeof onRejected === 'function' ? onRejected : ignoredRejected;
  return this.then(null, onRejected);
};

export default MyPromise;
