import {announce} from '@react-aria/live-announcer';
import {AriaLabelingProps, DOMAttributes} from '@react-types/shared';
import {focusWithoutScrolling, mergeProps} from '@react-aria/utils';
import {getInteractionModality, useFocusWithin, useHover} from '@react-aria/interactions';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {RefObject, useEffect, useRef} from 'react';
import {ToastState} from '@react-stately/toast';
import {useLandmark} from '@react-aria/landmark';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

export interface AriaToastRegionProps extends AriaLabelingProps {
  /**
   * An accessibility label for the toast region.
   * @default "Notifications"
   */
  'aria-label'?: string
}

export interface ToastRegionAria {
  /** Props for the landmark region element. */
  regionProps: DOMAttributes
}

/**
 * Provides the behavior and accessibility implementation for a toast region containing one or more toasts.
 * Toasts display brief, temporary notifications of actions, errors, or other events in an application.
 */
export function useToastRegion<T>(props: AriaToastRegionProps, state: ToastState<T>, ref: RefObject<HTMLElement>): ToastRegionAria {
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/toast');
  let {landmarkProps} = useLandmark({
    role: 'region',
    'aria-label': props['aria-label'] || stringFormatter.format('notifications')
  }, ref);

  let {hoverProps} = useHover({
    onHoverStart: state.pauseAll,
    onHoverEnd: state.resumeAll
  });

  let lastFocused = useRef(null);
  let timeoutId:ReturnType<typeof setTimeout>;
  let {focusWithinProps} = useFocusWithin({
    onFocusWithin: (e) => {
      state.pauseAll();
      lastFocused.current = e.relatedTarget;
      if (ref.current?.contains(document.activeElement)) {
        let count: number = state.visibleToasts.length || 0;
        let announcement = stringFormatter.format('countAnnouncement', {count});
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = undefined;
        }
        timeoutId = setTimeout(() => announce(announcement, 'polite'), 750);
      }
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
        if (getInteractionModality() === 'pointer') {
          focusWithoutScrolling(lastFocused.current);
        } else {
          lastFocused.current.focus();
        }
      }
    };
  }, [ref]);

  return {
    regionProps: mergeProps(landmarkProps, hoverProps, focusWithinProps, {
      tabIndex: -1,
      // Mark the toast region as a "top layer", so that it:
      //   - is not aria-hidden when opening an overlay
      //   - allows focus even outside a containing focus scope
      //   - doesn’t dismiss overlays when clicking on it, even though it is outside
      // @ts-ignore
      'data-react-aria-top-layer': true
    })
  };
}
