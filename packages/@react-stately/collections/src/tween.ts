import {Point} from './Point';

// use high res timer if available
let perf = typeof window !== 'undefined' ? window.performance : null;
// @ts-ignore
let perfNow = perf && (perf.now || perf.webkitNow || perf.msNow || perf.mozNow);
let getTime = perfNow ? perfNow.bind(perf) : function () {
  return Date.now ? Date.now() : new Date().getTime();
};

// check if we need to get the time each frame (see below)
let fixTs = false;
requestAnimationFrame(function (t) {
  fixTs = (t > 1e12) !== (getTime() > 1e12);
});

export interface CancelablePromise<T> extends Promise<T> {
  cancel(): void
}

export function tween(begin, end, duration, ease, fn): CancelablePromise<void> {
  let canceled = false;
  let raf_id;

  let promise = new Promise(resolve => {
    let start = getTime();
    let diffX = end.x - begin.x;
    let diffY = end.y - begin.y;

    raf_id = requestAnimationFrame(function run(t) {
      // if we're using a high res timer, make sure timestamp is not the old epoch-based value.
      // http://updates.html5rocks.com/2012/05/requestAnimationFrame-API-now-with-sub-millisecond-precision
      if (fixTs) {
        t = getTime();
      }

      // check if we're done
      let delta = t - start;
      if (delta > duration) {
        fn(end);
        resolve();
      } else {
        // call frame callback after computing eased time and get the next frame
        let proceed = fn(new Point(
          begin.x + diffX * ease(delta / duration),
          begin.y + diffY * ease(delta / duration)
        ));
        if (proceed !== false && !canceled) {
          raf_id = requestAnimationFrame(run);
        }
      }
    });
  }) as CancelablePromise<void>;

  promise.cancel = function () {
    canceled = true;
    cancelAnimationFrame(raf_id);
  };

  return promise;
}

// easing functions
export function linearEasing(t) {
  return t;
}

export function easeOut(t) {
  return Math.sin(t * Math.PI / 2);
}
