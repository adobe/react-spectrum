import {AriaLabelingProps, DOMAttributes} from '@react-types/shared';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {RefObject, useEffect, useRef} from 'react';
import {ToastState} from '@react-stately/toast';
import {useFocusWithin, useHover} from '@react-aria/interactions';
import {useLandmark} from '@react-aria/landmark';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

export interface AriaToastRegionProps extends AriaLabelingProps {}
export interface ToastRegionAria {
  regionProps: DOMAttributes
}

export function useToastRegion<T>(props: AriaToastRegionProps, state: ToastState<T>, ref: RefObject<HTMLElement>): ToastRegionAria {
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let {landmarkProps} = useLandmark({
    role: 'region',
    'aria-label': props['aria-label'] || stringFormatter.format('notifications')
  }, ref);

  let {hoverProps} = useHover({
    onHoverStart: state.pauseAll,
    onHoverEnd: state.resumeAll
  });

  let lastFocused = useRef(null);
  let {focusWithinProps} = useFocusWithin({
    onFocusWithin: (e) => {
      state.pauseAll();
      lastFocused.current = e.relatedTarget;
    },
    onBlurWithin: () => {
      state.resumeAll();
      lastFocused.current = null;
    }
  });

  // When the region unmounts, restore focus to the last element that had focus
  // before the user moved focus into the region.
  // TODO: handle when the element has unmounted like FocusScope does?
  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    return () => {
      if (lastFocused.current && document.body.contains(lastFocused.current)) {
        lastFocused.current.focus();
      }
    };
  }, [ref]);

  return {
    regionProps: {
      ...landmarkProps,
      ...hoverProps,
      ...focusWithinProps,
      tabIndex: -1,
      // Mark the toast region as a "top layer", so that it:
      //   - is not aria-hidden when opening an overlay
      //   - allows focus even outside a containing focus scope
      //   - doesn’t dismiss overlays when clicking on it, even though it is outside
      // @ts-ignore
      'data-react-aria-top-layer': true
    }
  };
}
