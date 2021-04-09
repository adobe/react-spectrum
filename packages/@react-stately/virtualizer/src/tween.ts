/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Point} from './Point';

// use high res timer if available
let perf = typeof window !== 'undefined' ? window.performance : null;
// @ts-ignore
let perfNow = perf && (perf.now || perf.webkitNow || perf.msNow || perf.mozNow);
let getTime = perfNow ? perfNow.bind(perf) : function () {
  return Date.now ? Date.now() : new Date().getTime();
};

let fixTs: boolean;

export interface CancelablePromise<T> extends Promise<T> {
  cancel(): void
}

export function tween(begin, end, duration, ease, fn): CancelablePromise<void> {
  let canceled = false;
  let raf_id: number;

  let promise = new Promise(resolve => {
    let start = getTime();
    let diffX = end.x - begin.x;
    let diffY = end.y - begin.y;

    raf_id = requestAnimationFrame(function run(t) {
      // if we're using a high res timer, make sure timestamp is not the old epoch-based value.
      // http://updates.html5rocks.com/2012/05/requestAnimationFrame-API-now-with-sub-millisecond-precision
      if (fixTs == null) {
        fixTs = t > 1e12 !== getTime() > 1e12;
      }

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
