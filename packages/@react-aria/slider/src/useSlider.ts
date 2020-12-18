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

import {clamp, findLastIndex, mergeProps, useGlobalListeners} from '@react-aria/utils';
import {getSliderThumbId, sliderIds} from './utils';
import React, {HTMLAttributes, LabelHTMLAttributes, OutputHTMLAttributes, useRef} from 'react';
import {setInteractionModality, useMove} from '@react-aria/interactions';
import {SliderProps} from '@react-types/slider';
import {SliderState} from '@react-stately/slider';
import {useLabel} from '@react-aria/label';
import {useLocale} from '@react-aria/i18n';

interface SliderAria {
  /** Props for the label element. */
  labelProps: LabelHTMLAttributes<HTMLLabelElement>,

  /** Props for the root element of the slider component; groups slider inputs. */
  containerProps: HTMLAttributes<HTMLElement>,

  /** Props for the track element. */
  trackProps: HTMLAttributes<HTMLElement>,

  /** Props for the output element, displaying the value of the slider thumbs. */
  outputProps: OutputHTMLAttributes<HTMLOutputElement>
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
  let {labelProps, fieldProps} = useLabel(props);

  let isVertical = props.orientation === 'vertical';

  // Attach id of the label to the state so it can be accessed by useSliderThumb.
  sliderIds.set(state, labelProps.id ?? fieldProps.id);

  let {direction} = useLocale();

  let {addGlobalListener, removeGlobalListener} = useGlobalListeners();

  // When the user clicks or drags the track, we want the motion to set and drag the
  // closest thumb.  Hence we also need to install useMove() on the track element.
  // Here, we keep track of which index is the "closest" to the drag start point.
  // It is set onMouseDown/onTouchDown; see trackProps below.
  const realTimeTrackDraggingIndex = useRef<number | null>(null);

  const stateRef = useRef<SliderState>(null);
  stateRef.current = state;
  const reverseX = direction === 'rtl';
  const currentPosition = useRef<number>(null);
  const {moveProps} = useMove({
    onMoveStart() {
      currentPosition.current = null;
    },
    onMove({deltaX, deltaY}) {
      let size = isVertical ? trackRef.current.offsetHeight : trackRef.current.offsetWidth;

      if (currentPosition.current == null) {
        currentPosition.current = stateRef.current.getThumbPercent(realTimeTrackDraggingIndex.current) * size;
      }

      let delta = isVertical ? deltaY : deltaX;
      if (isVertical || reverseX) {
        delta = -delta;
      }

      currentPosition.current += delta;

      if (realTimeTrackDraggingIndex.current != null && trackRef.current) {
        const percent = clamp(currentPosition.current / size, 0, 1);
        stateRef.current.setThumbPercent(realTimeTrackDraggingIndex.current, percent);
      }
    },
    onMoveEnd() {
      if (realTimeTrackDraggingIndex.current != null) {
        stateRef.current.setThumbDragging(realTimeTrackDraggingIndex.current, false);
        realTimeTrackDraggingIndex.current = null;
      }
    }
  });

  let currentPointer = useRef<number | null | undefined>(undefined);
  let onDownTrack = (e: React.UIEvent, id: number, clientX: number, clientY: number) => {
    // We only trigger track-dragging if the user clicks on the track itself and nothing is currently being dragged.
    if (trackRef.current && !props.isDisabled && state.values.every((_, i) => !state.isThumbDragging(i))) {
      let size = isVertical ? trackRef.current.offsetHeight : trackRef.current.offsetWidth;
      // Find the closest thumb
      const trackPosition = trackRef.current.getBoundingClientRect()[isVertical ? 'top' : 'left'];
      const clickPosition = isVertical ? clientY : clientX;
      const offset = clickPosition - trackPosition;
      let percent = offset / size;
      if (direction === 'rtl' || isVertical) {
        percent = 1 - percent;
      }
      let value = state.getPercentValue(percent);

      const {less, greater} = state.values.reduce((acc, v, index) => {
        if (state.isThumbEditable(index)) {
          let distance = value - v;
          if (distance > 0 && Math.abs(distance) < acc.less.distance) {
            acc.less.distance = Math.abs(distance);
            acc.less.index = index;
          } else if (distance > 0 && Math.abs(distance) === acc.less.distance && index > acc.less.index) {
            acc.less.index = index;
          } else if (distance <= 0 && Math.abs(distance) < acc.greater.distance) {
            acc.greater.distance = Math.abs(distance);
            acc.greater.index = index;
          } else if (distance <= 0 && Math.abs(distance) === acc.greater.distance && index < acc.greater.index) {
            acc.greater.index = index;
          }
        }
        return acc;
      }, {less: {distance: Number.POSITIVE_INFINITY, index: NaN}, greater: {distance: Number.POSITIVE_INFINITY, index: NaN}});
      let closestThumb;
      if (less.distance < greater.distance) {
        closestThumb = less.index;
      } else {
        closestThumb = greater.index;
      }

      if (!isNaN(closestThumb)) {
        // Don't unfocus anything
        e.preventDefault();

        realTimeTrackDraggingIndex.current = closestThumb;
        state.setFocusedThumb(closestThumb);
        currentPointer.current = id;

        state.setThumbDragging(realTimeTrackDraggingIndex.current, true);
        state.setThumbValue(closestThumb, value);

        addGlobalListener(window, 'mouseup', onUpTrack, false);
        addGlobalListener(window, 'touchend', onUpTrack, false);
        addGlobalListener(window, 'pointerup', onUpTrack, false);
      } else {
        realTimeTrackDraggingIndex.current = null;
      }
    }
  };

  let onUpTrack = (e) => {
    let id = e.pointerId ?? e.changedTouches?.[0].identifier;
    if (id === currentPointer.current) {
      if (realTimeTrackDraggingIndex.current != null) {
        state.setThumbDragging(realTimeTrackDraggingIndex.current, false);
        realTimeTrackDraggingIndex.current = null;
      }

      removeGlobalListener(window, 'mouseup', onUpTrack, false);
      removeGlobalListener(window, 'touchend', onUpTrack, false);
      removeGlobalListener(window, 'pointerup', onUpTrack, false);
    }
  };

  if (labelProps.htmlFor) {
    // Override the `for` attribute to point to the first thumb instead of the group element.
    labelProps.htmlFor = labelProps.htmlFor ? getSliderThumbId(state, 0) : undefined,
    labelProps.onClick = () => {
      // Safari does not focus <input type="range"> elements when clicking on an associated <label>,
      // so do it manually. In addition, make sure we show the focus ring.
      document.getElementById(getSliderThumbId(state, 0))?.focus();
      setInteractionModality('keyboard');
    };
  }

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
      onMouseDown(e: React.MouseEvent<HTMLElement>) { onDownTrack(e, undefined, e.clientX, e.clientY); },
      onPointerDown(e: React.PointerEvent<HTMLElement>) { onDownTrack(e, e.pointerId, e.clientX, e.clientY); },
      onTouchStart(e: React.TouchEvent<HTMLElement>) { onDownTrack(e, e.changedTouches[0].identifier, e.changedTouches[0].clientX, e.changedTouches[0].clientY); }
    }, moveProps),
    outputProps: {
      htmlFor: state.values.map((_, index) => getSliderThumbId(state, index)).join(' '),
      'aria-labelledby': labelProps.id,
      'aria-live': 'off'
    }
  };
}
