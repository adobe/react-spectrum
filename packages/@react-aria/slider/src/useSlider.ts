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

import {HTMLAttributes, useRef} from 'react';
import {mergeProps, useDrag1D} from '@react-aria/utils';
import {sliderIds} from './utils';
import {SliderProps} from '@react-types/slider';
import {SliderState} from '@react-stately/slider';
import {useLabel} from '@react-aria/label';

interface SliderAria {
  /** Props for the label element. */
  labelProps: HTMLAttributes<HTMLElement>,

  /** Props for the root element of the slider component; groups slider inputs. */
  containerProps: HTMLAttributes<HTMLElement>,

  /** Props for the track element. */
  trackProps: HTMLAttributes<HTMLElement>
}

/**
 * Provides behavior and accessibility for a slider component.
 *
 * @param props Props for the slider.
 * @param state State for the slider, as returned by `useSliderState`.
 * @param trackRef Ref for the "track" element.  The width of this element provides the "length"
 * of the track -- the span of one dimensional space that the slider thumb can be.  It also
 * accepts click and drag motions, so that the closest thumb will follow clicks and drags on
 * the track.
 */
export function useSlider(
  props: SliderProps,
  state: SliderState,
  trackRef: React.RefObject<HTMLElement>
): SliderAria {
  const {labelProps, fieldProps} = useLabel(props);

  const isSliderEditable = !(props.isDisabled || props.isReadOnly);

  // Attach id of the label to the state so it can be accessed by useSliderThumb.
  sliderIds.set(state, labelProps.id ?? fieldProps.id);

  // When the user clicks or drags the track, we want the motion to set and drag the
  // closest thumb.  Hence we also need to install useDrag1D() on the track element.
  // Here, we keep track of which index is the "closest" to the drag start point.
  // It is set onMouseDown; see trackProps below.
  const realTimeTrackDraggingIndex = useRef<number | undefined>(undefined);
  const isTrackDragging = useRef(false);
  const {onMouseDown, onMouseEnter, onMouseOut} = useDrag1D({
    containerRef: trackRef as any,
    reverse: false,
    orientation: 'horizontal',
    onDrag: (dragging) => {
      if (realTimeTrackDraggingIndex.current !== undefined) {
        state.setThumbDragging(realTimeTrackDraggingIndex.current, dragging);
      }
      isTrackDragging.current = dragging;
    },
    onPositionChange: (position) => {
      if (realTimeTrackDraggingIndex.current !== undefined && trackRef.current) {
        const percent = position / trackRef.current.offsetWidth;
        state.setThumbPercent(realTimeTrackDraggingIndex.current, percent);

        // When track-dragging ends, onDrag is called before a final onPositionChange is
        // called, so we can't reset realTimeTrackDraggingIndex until onPositionChange,
        // as we still needed to update the thumb position one last time.  Hence we
        // track whether we're dragging, and the actual dragged index, separately.
        if (!isTrackDragging.current) {
          realTimeTrackDraggingIndex.current = undefined;
        }
      }
    }
  });

  return {
    labelProps,

    // The root element of the Slider will have role="group" to group together
    // all the thumb inputs in the Slider.  The label of the Slider will
    // be used to label the group.
    containerProps: {
      role: 'group',
      ...fieldProps
    },
    trackProps: mergeProps({
      onMouseDown: (e: React.MouseEvent<HTMLElement>) => {
        // We only trigger track-dragging if the user clicks on the track itself.
        if (trackRef.current && isSliderEditable) {
          // Find the closest thumb
          const trackPosition = trackRef.current.getBoundingClientRect().left;
          const clickPosition = e.clientX;
          const offset = clickPosition - trackPosition;
          const percent = offset / trackRef.current.offsetWidth;
          const value = state.getPercentValue(percent);

          // Only compute the diff for thumbs that are editable, as only they can be dragged
          const minDiff = Math.min(...state.values.map((v, index) => state.isThumbEditable(index) ? Math.abs(v - value) : Number.POSITIVE_INFINITY));
          const index = state.values.findIndex(v => Math.abs(v - value) === minDiff);
          if (minDiff !== Number.POSITIVE_INFINITY && index >= 0) {
            // Don't unfocus anything
            e.preventDefault();

            realTimeTrackDraggingIndex.current = index;
            state.setFocusedThumb(index);

            // We immediately toggle state to dragging and set the value on mouse down.
            // We set the value now, instead of waiting for onDrag, so that the thumb
            // is updated while you're still holding the mouse button down.  And we
            // set dragging on now, so that onChangeEnd() won't fire yet when we set
            // the value.  Dragging state will be reset to false in onDrag above, even
            // if no dragging actually occurs.
            state.setThumbDragging(realTimeTrackDraggingIndex.current, true);
            state.setThumbValue(index, value);
          } else {
            realTimeTrackDraggingIndex.current = undefined;
          }
        }
      }
    }, {
      onMouseDown, onMouseEnter, onMouseOut
    })
  };
}
