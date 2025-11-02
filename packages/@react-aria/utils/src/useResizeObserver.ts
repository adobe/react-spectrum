
import {RefObject} from '@react-types/shared';
import {useEffect} from 'react';
import {useEffectEvent} from './useEffectEvent';

function hasResizeObserver() {
  return typeof window.ResizeObserver !== 'undefined';
}

type useResizeObserverOptionsType<T> = {
  ref: RefObject<T | undefined | null> | undefined,
  box?: ResizeObserverBoxOptions,
  onResize: () => void
}

export function useResizeObserver<T extends Element>(options: useResizeObserverOptionsType<T>): void {
  // Only call onResize from inside the effect, otherwise we'll void our assumption that
  // useEffectEvents are safe to pass in.
  const {ref, box, onResize} = options;
  let onResizeEvent = useEffectEvent(onResize);

  useEffect(() => {
    let element = ref?.current;
    if (!element) {
      return;
    }

    if (!hasResizeObserver()) {
      window.addEventListener('resize', onResizeEvent, false);
      return () => {
        window.removeEventListener('resize', onResizeEvent, false);
      };
    } else {

      const resizeObserverInstance = new window.ResizeObserver((entries) => {
        if (!entries.length) {
          return;
        }

        onResizeEvent();
      });
      resizeObserverInstance.observe(element, {box});

      return () => {
        if (element) {
          resizeObserverInstance.unobserve(element);
        }
      };
    }

  }, [ref, box]);
}
