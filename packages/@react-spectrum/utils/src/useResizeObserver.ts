import {RefObject, useEffect} from 'react';

function hasResizeObserver() {
  return typeof (<any>window).ResizeObserver !== 'undefined';
}

type useResizeObserverOptionsType<T> = {
  ref: RefObject<T>,
  onResize: () => void
}

export function useResizeObserver<T extends HTMLElement>(options: useResizeObserverOptionsType<T>) {
  const {ref, onResize} = options;

  useEffect(() => {
    if (!ref) {return; }

    if (!hasResizeObserver()) {
      window.addEventListener('resize', onResize, false);
      return () => {
        window.removeEventListener('resize', onResize, false);
      };
    } else {

      const resizeObserverInstance = (<any>window).ResizeObserver((entries:any) => {
        if (!entries.length) {
          return;
        }

        onResize();
      });
      resizeObserverInstance.observe(ref.current);

      return () => {
        resizeObserverInstance.unobserve(ref.current);
      };
    }

  }, [onResize, ref]);
}
