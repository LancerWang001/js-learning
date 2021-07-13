// extends native

/**
 * Design achievement
 * 1. Create a native instance.
 * 2. Set native instance's [[prototype]] to Subtype prototype
 * 3. Set Subtype's prototype to native prototype
 */

// Sub type
function SubTypeOfNative() { };
// New native instance
const ni = new Date();
// Set Sub type prototype to native instance 
Object.setPrototypeOf(ni, SubTypeOfNative.prototype);
// Set native prototype to Sub type prototype
Object.setPrototypeOf(SubTypeOfNative.prototype, Date.prototype);

console.log(ni.getTime())

// Can't change to premitive value

function SubPremitive() { }
const newstr = new String('my string');
Object.setPrototypeOf(newstr, SubPremitive.prototype);
Object.setPrototypeOf(SubPremitive.prototype, String.prototype);

console.log(typeof newstr); // object

