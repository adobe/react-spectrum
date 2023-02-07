import {RefObject, useEffect, useRef} from 'react';

function hasResizeObserver() {
  return typeof window.ResizeObserver !== 'undefined';
}

type useResizeObserverOptionsType<T> = {
  ref: RefObject<T | undefined> | undefined,
  onResize: () => void
}

export function useResizeObserver<T extends Element>(options: useResizeObserverOptionsType<T>) {
  const {ref, onResize} = options;
  let raf = useRef(null);

  useEffect(() => {
    let element = ref?.current;
    if (!element) {
      return;
    }

    if (!hasResizeObserver()) {
      window.addEventListener('resize', onResize, false);
      return () => {
        window.removeEventListener('resize', onResize, false);
      };
    } else {
      const resizeObserverInstance = new window.ResizeObserver((entries) => {
        if (raf.current) {
          window.cancelAnimationFrame(raf.current);
        }
        raf.current = window.requestAnimationFrame(() => {
          if (!Array.isArray(entries) || !entries.length) {
            return;
          }
          onResize();
        });
      });

      resizeObserverInstance.observe(element);

      return () => {
        if (raf.current) {
          window.cancelAnimationFrame(raf.current);
        }
        if (element) {
          resizeObserverInstance.unobserve(element);
        }
      };
    }

  }, [onResize, ref]);
}
