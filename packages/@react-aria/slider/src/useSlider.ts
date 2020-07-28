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

import {computeOffsetToValue} from './utils';
import {HTMLAttributes, useRef} from 'react';
import {mergeProps, useDrag1D} from '@react-aria/utils';
import {SliderProps, CommonSliderThumbProps} from '@react-types/slider';
import {SliderState} from '@react-stately/slider';
import {useLabel} from '@react-aria/label';

interface SliderAria {
  /** Props for the label element. */
  labelProps: HTMLAttributes<HTMLElement>;

  /** Props for the root element of the slider component; groups slider inputs. */
  containerProps: HTMLAttributes<HTMLElement>;

  /** Props for the track element. */
  trackProps: HTMLAttributes<HTMLElement>;

  /** Partial props that should be passed into `useSliderThumb` for all thumbs.  
   * Includes the Label ID for labeling slider inputs. */
  commonThumbProps: CommonSliderThumbProps;
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

  // When the user clicks or drags the track, we want the motion to set and drag the 
  // closest thumb.  Hence we also need to install useDrag1D() on the track element.
  // Here, we keep track of which index is the "closest" to the drag start point.
  // It is set onMouseDown; see trackProps below.
  const realTimeTrackDraggingIndex = useRef<number | undefined>(undefined);
  const draggableProps = useDrag1D({
    containerRef: trackRef as any,
    reverse: false,
    orientation: 'horizontal',
    onDrag: (dragging) => {
      if (realTimeTrackDraggingIndex.current !== undefined) {
        state.setDragging(realTimeTrackDraggingIndex.current, dragging);
      }
    },
    onPositionChange: (position) => {
      if (realTimeTrackDraggingIndex.current !== undefined) {
        state.setValue(realTimeTrackDraggingIndex.current, computeOffsetToValue(position, props, trackRef));
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
        if (trackRef.current && trackRef.current === e.target) {
          // Find the closest thumb
          const trackPosition = trackRef.current.getBoundingClientRect().left;
          const clickPosition = e.clientX;
          const offset = clickPosition - trackPosition;
          const value = computeOffsetToValue(offset, props, trackRef);
          const minDiff = Math.min(...state.values.map(v => Math.abs(v - value)));
          const index = state.values.findIndex(v => Math.abs(v - value) === minDiff);
          if (index >= 0) {
            // Don't unfocus anything
            e.preventDefault();

            realTimeTrackDraggingIndex.current = index;
            state.setFocusedIndex(index);
          }
        }
      }
    }, draggableProps),
    commonThumbProps: {
      labelId: (labelProps.id ?? fieldProps.id)!
    }
  };
}
