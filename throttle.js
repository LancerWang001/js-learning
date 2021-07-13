// throttle

const now = () => Date.now();

const throttle = (func, wait = 1000, options) => {
  // previous time
  let previous = 0;
  //  timer
  let timer;
  // leading && trailing
  const { leading, trailing } = options ?? {};
  return function (...params) {
    // If the trailing timer is running, just return
    if (timer) return;
    // If no leading, record current moment for remaining calculation
    if (!leading && !previous) previous = now();
    const remaining = wait - (now() - previous);
    // If timeout, fire the callback
    if (remaining < 0 || remaining > wait) {
      func.apply(this, params);
      previous = now();
    } else if (trailing) {
      // If trailing, set the trailing timer with the remaining time
      timer = setTimeout(() => {
        func.apply(this, params);
        // Empty trailing timer after callback fired
        timer = null;
        // If leading, should reinit previous
        if (leading) previous = 0;
        // If no leading, record current moment
        else previous = now();
      }, remaining);
    }
  };
};

export default throttle;
