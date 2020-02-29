export function Timer(callback, delay) {
  var timerId, start, remaining = delay;

  this.pause = () => {
    clearTimeout(timerId);
    remaining -= Date.now() - start;
  };

  this.resume = () => {
    start = Date.now();
    clearTimeout(timerId);
    timerId = setTimeout(callback, remaining);
  };

  this.clear = () => {
    clearTimeout(timerId);
  };

  this.resume();
}
