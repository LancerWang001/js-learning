// appendChains
Object.isBuiltIn = function (proto) {
  return proto.constructor.toString().includes('[native code]');
}

// The function is not complete
// Can't mix the native contructors together!!!
Object.appendChain = function (oChain, oProto) {
  if (arguments.length < 2) {
    throw new TypeError('Object.appendChain - Not enough arguments');
  }
  if (Object.isBuiltIn(oChain)) throw new TypeError(
    'Object.appendChain - Can\'t append prototype to a builtIn Constructor '
    + oChain.constructor.toString() + '.'
  );
  if (!oProto || typeof oProto !== 'object') throw new TypeError(
    'Object.appendChain - oProto : ('
    + oProto + ') must be an object.'
  );
  // Search the second prototype of the chain.
  let oSecond = Object.create(oChain);

  for (
    let oFirst = Object.getPrototypeOf(oSecond);
    !Object.isBuiltIn(oFirst);
    oFirst = Object.getPrototypeOf(oSecond)
  ) {
    oSecond = oFirst;
  }
  Object.setPrototypeOf(oSecond, oProto);
}