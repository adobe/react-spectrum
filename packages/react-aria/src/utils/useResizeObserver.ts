import {getOwnerWindow} from './domHelpers';
import {RefObject} from '@react-types/shared';
import {useEffect} from 'react';
import {useEffectEvent} from './useEffectEvent';

type useResizeObserverOptionsType<T> = {
  ref: RefObject<T | undefined | null> | undefined;
  box?: ResizeObserverBoxOptions;
  onResize: () => void;
};

export function useResizeObserver<T extends Element>(
  options: useResizeObserverOptionsType<T>
): void {
  // Only call onResize from inside the effect, otherwise we'll void our assumption that
  // useEffectEvents are safe to pass in.
  const {ref, box, onResize} = options;
  let onResizeEvent = useEffectEvent(onResize);

  useEffect(() => {
    let element = ref?.current;
    if (!element) {
      return;
    }

    let ownerWindow = getOwnerWindow(element);
    if (typeof ownerWindow.ResizeObserver === 'undefined') {
      ownerWindow.addEventListener('resize', onResizeEvent, false);
      return () => {
        ownerWindow.removeEventListener('resize', onResizeEvent, false);
      };
    } else {
      const resizeObserverInstance = new ownerWindow.ResizeObserver(entries => {
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
