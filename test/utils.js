export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function rAF(func = () => {}) {
  return new Promise(
    resolve => requestAnimationFrame(
      () => {
        func();
        resolve();
      }
    )
  );
}

export function nextEventLoopIteration() {
  return new Promise(resolve => process.nextTick(resolve));
}
