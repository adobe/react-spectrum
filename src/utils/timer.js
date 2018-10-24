export default class Timer {

  constructor(callback, delay) {
    this.callback = callback;
    this.remaining = delay;
    this.resume();
  }

  pause() {
    window.clearTimeout(this.timerId);
    this.remaining -= new Date() - this.start;
  }

  resume() {
    this.start = new Date();
    if (this.timerId) {
      window.clearTimeout(this.timerId);
    }
    this.timerId = window.setTimeout(this.callback, this.remaining);
  }
}
