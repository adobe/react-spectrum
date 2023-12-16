import {RefObject, useEffect} from 'react';

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
      } catch (err) {
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

export function useIntersectionObserver(ref: RefObject<HTMLElement>, onIntersect: () => Function | void) {
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
