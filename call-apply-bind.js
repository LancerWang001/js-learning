/**
 * @description call / apply / bind are all used to change the reference of 'this' key word
 * @achievement
 *    1. If the first argument is empty or null / undefined, set its value as window
 *    2. Add a the function to the context, delete the function from context after exection
 */

Function.prototype.myCall = function (context, ...params) {
  // recieve context from argument, set as window default
  const myContext = context || window;
  // keep the method named 'fn' from context instance
  const oldFn = myContext.fn;
  // add current callback to context
  myContext.fn = this;
  // execute the fn with context
  const result = myContext.fn(...params);
  // delete the fn method
  delete myContext.fn;
  if (oldFn) myContext.fn = oldFn;
  return result;
};

Function.prototype.myApply = function (context, params) {
  const myContext = context || window;
  const oldFn = myContext.fn;
  // recieve params
  let myParams = [];
  if (params && Symbol.iterator in params) {
    myParams = params;
  }
  myContext.fn = this;
  const result = myContext.fn(...myParams);
  delete myContext.fn;
  if (oldFn) myContext.fn = oldFn;
  return result;
};

Function.prototype.myBind = function (context, ...preParams) {
  const myContext = context || window;
  const _this = this;
  return function F(...params) {
    // concat realParams
    const realParams = preParams.concat(params);
    if (this instanceof F) {
      return new _this(realParams);
    }
    return _this.apply(myContext, realParams);
  };
};
