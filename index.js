import MyPromise from './promise.js';


MyPromise.race([
  new MyPromise((resolve) => {
    setTimeout(resolve, 3000, '1111')
  }),
  new MyPromise((resolve) => {
    setTimeout(resolve, 1000, '2222')
  }),
  '3333'
]).then((r) => {
  console.log(r)
}).catch((r) => {
  console.log(r)
})
