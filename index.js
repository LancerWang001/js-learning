import './call-apply-bind.js';

function F() { };
const f = F.myBind(null);
const instance = new f();
console.log(instance);

