// extends
function Super(name, job) {
  this.name = name;
  this.job = job;
}

Super.prototype.getJobName = function () {
  return this.job;
}

function Sub(...params) {
  // Manually fire Super constructor
  Super.apply(this, params);
};

Object.setPrototypeOf(Sub.prototype, Object.create(Super.prototype, {
  constructor: {
    value: Sub,
    configurable: true,
    enumerable: false,
    writable: false
  }
}));

const instance = new Sub('zhangsan', 'worker');

console.log(instance)

export default instance;
