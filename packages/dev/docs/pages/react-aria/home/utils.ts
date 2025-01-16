/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {RefObject} from '@react-types/shared';
import {useEffect} from 'react';

async function *createAnimationQueue() {
  while (true) {
    let {isCanceled, run} = yield;
    if (!isCanceled) {
      await run();
    }
  }
}

export let animationQueue = createAnimationQueue();
animationQueue.next(); // advance to first yield

export function animate(steps: any[]) {
  let cancelCurrentStep;
  async function run() {
    for (let step of steps) {
      try {
        await step.perform();
        let {promise, cancel} = sleep(step.time);
        cancelCurrentStep = cancel;
        await promise;
      } catch {
        break;
      }
    }
  }

  let job = {isCanceled: false, run};
  animationQueue.next(job);

  return () => {
    job.isCanceled = true;
    if (cancelCurrentStep) {
      cancelCurrentStep();
    }
  };
}

function sleep(ms: number) {
  let timeout;
  let cancel;
  let promise = new Promise((resolve, reject) => {
    timeout = setTimeout(resolve, ms);
    cancel = reject;
  });

  return {
    promise,
    cancel() {
      clearTimeout(timeout);
      cancel();
    }
  };
}

export function useIntersectionObserver(ref: RefObject<HTMLElement | null>, onIntersect: () => Function | void) {
  useEffect(() => {
    let element = ref.current;
    if (!element) {
      return;
    }

    let cancel: Function | void = undefined;
    let observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        cancel = onIntersect();
      } else if (typeof cancel === 'function') {
        cancel();
        cancel = undefined;
      }
    }, {threshold: 1});

    observer.observe(element);
    return () => {
      if (typeof cancel === 'function') {
        cancel();
      }
      observer.unobserve(element!);
    };
  }, [ref, onIntersect]);
}
