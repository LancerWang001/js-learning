// debounce

const debounce = (func, wait = 50, immediate) => {
  // timer
  let timer = 0;
  // context, args to keep this and arguments
  let context, args;
  // later timer creator
  const later = () => setTimeout(() => {
    // Empty previous timer before setting new later timer
    timer = null;
    // If immediate, don't fire callback again
    if (!immediate) {
      func.apply(context, args);
      context = args = null;
    }
  }, wait);
  return (...params) => {
    if (!timer) {
      // If there is no timer, just set a new timer
      timer = later();
      // If immediate, fire the callback and keep the context and argument
      if (immediate) {
        func.apply(this, params);
        context = this;
        args = params;
      }
    } else {
      // If there's already a timer, clear the timer and replace it with a new one
      window.clearTimeout(timer);
      timer = later();
    }
  };
}

export default debounce;
