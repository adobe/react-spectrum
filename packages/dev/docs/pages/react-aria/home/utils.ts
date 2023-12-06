import { RefObject, useEffect } from "react";

export function animate(steps: any[]) {
  let cancelCurrentStep;
  async function run() {
    for (let step of steps) {
      step.perform();
      let {promise, cancel} = sleep(step.time);
      cancelCurrentStep = cancel;
      await promise;
    }
  }

  run();

  return () => {
    if (cancelCurrentStep) {
      cancelCurrentStep();
    }
  };
}

function sleep(ms: number) {
  let timeout;
  let promise = new Promise(resolve => {
    timeout = setTimeout(resolve, ms);
  });

  return {
    promise,
    cancel() {
      clearTimeout(timeout);
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
      observer.unobserve(element!)
    };
  }, [ref]);
}
