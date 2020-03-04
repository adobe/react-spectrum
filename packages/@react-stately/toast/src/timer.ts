export function Timer(callback: () => void, delay: number) {
  let timerId, start;
  let remaining = delay;

  this.pause = () => {
    clearTimeout(timerId);
    remaining -= Date.now() - start;
  };

  this.resume = () => {
    start = Date.now();
    timerId && clearTimeout(timerId);
    timerId = setTimeout(callback, remaining);
  };

  this.clear = () => {
    clearTimeout(timerId);
  };

  this.resume();
}
