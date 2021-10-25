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

import {AriaColorAreaProps} from '@react-types/color';
import {ColorAreaState} from '@react-stately/color';
import {focusWithoutScrolling, mergeProps, useGlobalListeners, useLabels} from '@react-aria/utils';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {MessageDictionary} from '@internationalized/message';
import React, {ChangeEvent, HTMLAttributes, InputHTMLAttributes, RefObject, useCallback, useRef} from 'react';
import {useLocale} from '@react-aria/i18n';
import {useMove} from '@react-aria/interactions';
import {useVisuallyHidden} from '@react-aria/visually-hidden';

const messages = new MessageDictionary(intlMessages);

interface ColorAreaAria {
  /** Props for the color area container element. */
  colorAreaProps: HTMLAttributes<HTMLElement>,
  /** Props for the color area gradient foreground element. */
  gradientProps: HTMLAttributes<HTMLElement>,
  /** Props for the thumb element. */
  thumbProps: HTMLAttributes<HTMLElement>,
  /** Props for the visually hidden horizontal range input element. */
  xInputProps: InputHTMLAttributes<HTMLInputElement>,
  /** Props for the visually hidden vertical range input element. */
  yInputProps: InputHTMLAttributes<HTMLInputElement>
}

/**
 * Provides the behavior and accessibility implementation for a color wheel component.
 * Color wheels allow users to adjust the hue of an HSL or HSB color value on a circular track.
 */
export function useColorArea(props: AriaColorAreaProps, state: ColorAreaState, inputXRef: RefObject<HTMLElement>, inputYRef: RefObject<HTMLElement>, containerRef: RefObject<HTMLElement>): ColorAreaAria {
  let {
    isDisabled
  } = props;

  let {addGlobalListener, removeGlobalListener} = useGlobalListeners();

  let {direction, locale} = useLocale();

  let focusedInputRef = useRef<HTMLElement>(null);

  let focusInput = useCallback((inputRef:RefObject<HTMLElement> = inputXRef) => {
    if (inputRef.current) {
      focusWithoutScrolling(inputRef.current);
    }
  }, [inputXRef]);

  let stateRef = useRef<ColorAreaState>(null);
  stateRef.current = state;
  let {xChannel, yChannel} = stateRef.current.channels;
  let xChannelStep = stateRef.current.xChannelStep;
  let yChannelStep = stateRef.current.xChannelStep;

  let currentPosition = useRef<{x: number, y: number}>(null);

  let moveHandler = {
    onMoveStart() {
      currentPosition.current = null;
      stateRef.current.setDragging(true);
    },
    onMove({deltaX, deltaY, pointerType, isPage = false}) {
      if (currentPosition.current == null) {
        currentPosition.current = stateRef.current.getThumbPosition();
      }
      let {width, height} = containerRef.current.getBoundingClientRect();
      if (pointerType === 'keyboard') {
        if (deltaX > 0) {
          stateRef.current.incrementX(isPage);
        } else if (deltaX < 0) {
          stateRef.current.decrementX(isPage);
        } else if (deltaY > 0) {
          stateRef.current.decrementY(isPage);
        } else if (deltaY < 0) {
          stateRef.current.incrementY(isPage);
        }
        // set the focused input based on which axis has the greater delta
        focusedInputRef.current = (deltaX !== 0 || deltaY !== 0) && Math.abs(deltaY) > Math.abs(deltaX) ? inputYRef.current : inputXRef.current;
      }
      currentPosition.current.x += (direction === 'rtl' ? -1 : 1) * deltaX / width ;
      currentPosition.current.y += deltaY / height;
      if (pointerType !== 'keyboard') {
        stateRef.current.setColorFromPoint(currentPosition.current.x, currentPosition.current.y);
      }
    },
    onMoveEnd() {
      isOnColorArea.current = undefined;
      stateRef.current.setDragging(false);
      focusInput(focusedInputRef.current ? focusedInputRef : inputXRef);
      focusedInputRef.current = undefined;
    }
  };
  let {moveProps: movePropsThumb} = useMove(moveHandler);

  let currentPointer = useRef<number | null | undefined>(undefined);
  let isOnColorArea = useRef<boolean>(false);
  let {moveProps: movePropsContainer} = useMove({
    onMoveStart() {
      if (isOnColorArea.current) {
        moveHandler.onMoveStart();
      }
    },
    onMove(e) {
      if (isOnColorArea.current) {
        moveHandler.onMove(e);
      }
    },
    onMoveEnd() {
      if (isOnColorArea.current) {
        moveHandler.onMoveEnd();
      }
    }
  });

  let onThumbDown = (id: number | null) => {
    if (!state.isDragging) {
      currentPointer.current = id;
      focusInput();
      state.setDragging(true);
      if (typeof PointerEvent !== 'undefined') {
        addGlobalListener(window, 'pointerup', onThumbUp, false);
      } else {
        addGlobalListener(window, 'mouseup', onThumbUp, false);
        addGlobalListener(window, 'touchend', onThumbUp, false);
      }
    }
  };

  let onThumbUp = (e) => {
    let id = e.pointerId ?? e.changedTouches?.[0].identifier;
    if (id === currentPointer.current) {
      focusInput();
      state.setDragging(false);
      currentPointer.current = undefined;
      isOnColorArea.current = false;

      if (typeof PointerEvent !== 'undefined') {
        removeGlobalListener(window, 'pointerup', onThumbUp, false);
      } else {
        removeGlobalListener(window, 'mouseup', onThumbUp, false);
        removeGlobalListener(window, 'touchend', onThumbUp, false);
      }
    }
  };

  let onColorAreaDown = (colorArea: Element, id: number | null, clientX: number, clientY: number) => {
    let rect = colorArea.getBoundingClientRect();
    let {width, height} = rect;
    let x = (clientX - rect.x) / width;
    let y = (clientY - rect.y) / height;
    if (direction === 'rtl') {
      x = 1 - x;
    }
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1 && !state.isDragging && currentPointer.current === undefined) {
      isOnColorArea.current = true;
      currentPointer.current = id;
      state.setColorFromPoint(x, y);

      focusInput();
      state.setDragging(true);

      if (typeof PointerEvent !== 'undefined') {
        addGlobalListener(window, 'pointerup', onColorAreaUp, false);
      } else {
        addGlobalListener(window, 'mouseup', onColorAreaUp, false);
        addGlobalListener(window, 'touchend', onColorAreaUp, false);
      }
    }
  };

  let onColorAreaUp = (e) => {
    let id = e.pointerId ?? e.changedTouches?.[0].identifier;
    if (isOnColorArea.current && id === currentPointer.current) {
      isOnColorArea.current = false;
      currentPointer.current = undefined;
      state.setDragging(false);
      focusInput();

      if (typeof PointerEvent !== 'undefined') {
        removeGlobalListener(window, 'pointerup', onColorAreaUp, false);
      } else {
        removeGlobalListener(window, 'mouseup', onColorAreaUp, false);
        removeGlobalListener(window, 'touchend', onColorAreaUp, false);
      }
    }
  };

  let colorAreaInteractions = isDisabled ? {} : mergeProps({
    ...(typeof PointerEvent !== 'undefined' ? {
      onPointerDown: (e: React.PointerEvent) => {
        if (e.pointerType === 'mouse' && (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey)) {
          return;
        }
        onColorAreaDown(e.currentTarget, e.pointerId, e.clientX, e.clientY);
      }} : {
        onMouseDown: (e: React.MouseEvent) => {
          if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey) {
            return;
          }
          onColorAreaDown(e.currentTarget, undefined, e.clientX, e.clientY);
        },
        onTouchStart: (e: React.TouchEvent) => {
          onColorAreaDown(e.currentTarget, e.changedTouches[0].identifier, e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        }
      })
  }, movePropsContainer);

  let thumbInteractions = isDisabled ? {} : mergeProps({
    ...(typeof PointerEvent !== 'undefined' ? {
      onPointerDown: (e: React.PointerEvent) => {
        if (e.pointerType === 'mouse' && (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey)) {
          return;
        }
        onThumbDown(e.pointerId);
      }} : {
        onMouseDown: (e: React.MouseEvent) => {
          if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey) {
            return;
          }
          onThumbDown(undefined);
        },
        onTouchStart: (e: React.TouchEvent) => {
          onThumbDown(e.changedTouches[0].identifier);
        }
      })
  }, movePropsThumb);


  let xInputLabellingProps = useLabels({
    ...props,
    'aria-label': `${state.value.getChannelName(xChannel, locale)} / ${state.value.getChannelName(yChannel, locale)}`
  });

  let yInputLabellingProps = useLabels({
    ...props,
    'aria-label': `${state.value.getChannelName(xChannel, locale)} / ${state.value.getChannelName(yChannel, locale)}`
  });

  let colorAriaLabellingProps = useLabels(props);

  let getValueTitle = () =>  [
    `${state.value.getChannelName('red', locale)}: ${state.value.formatChannelValue('red', locale)}`,
    `${state.value.getChannelName('green', locale)}: ${state.value.formatChannelValue('green', locale)}`,
    `${state.value.getChannelName('blue', locale)}: ${state.value.formatChannelValue('blue', locale)}`
  ].join(', ');

  let ariaRoleDescription = messages.getStringForLocale('twoDimensionalSlider', locale);

  let {visuallyHiddenProps} = useVisuallyHidden({style: {
    opacity: '0.0001',
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
  }});

  return {
    colorAreaProps: {
      ...colorAriaLabellingProps,
      ...colorAreaInteractions,
      role: 'group'
    },
    gradientProps: {},
    thumbProps: {
      ...thumbInteractions
    },
    xInputProps: {
      ...xInputLabellingProps,
      ...visuallyHiddenProps,
      type: 'range',
      min: state.value.getChannelRange(xChannel).minValue,
      max: state.value.getChannelRange(xChannel).maxValue,
      step: xChannelStep,
      'aria-roledescription': ariaRoleDescription,
      'aria-valuetext': [
        `${state.value.getChannelName(xChannel, locale)}: ${state.value.formatChannelValue(xChannel, locale)}`,
        `${state.value.getChannelName(yChannel, locale)}: ${state.value.formatChannelValue(yChannel, locale)}`
      ].join(', '),
      title: getValueTitle(),
      disabled: isDisabled,
      value: state.value.getChannelValue(xChannel),
      tabIndex: 0,
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        state.setXValue(parseFloat(e.target.value));
      }
    },
    yInputProps: {
      ...yInputLabellingProps,
      ...visuallyHiddenProps,
      type: 'range',
      min: state.value.getChannelRange(yChannel).minValue,
      max: state.value.getChannelRange(yChannel).maxValue,
      step: yChannelStep,
      'aria-roledescription': ariaRoleDescription,
      'aria-valuetext': [
        `${state.value.getChannelName(yChannel, locale)}: ${state.value.formatChannelValue(yChannel, locale)}`,
        `${state.value.getChannelName(xChannel, locale)}: ${state.value.formatChannelValue(xChannel, locale)}`
      ].join(', '),
      'aria-orientation': 'vertical',
      title: getValueTitle(),
      disabled: isDisabled,
      value: state.value.getChannelValue(yChannel),
      tabIndex: -1,
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        state.setYValue(parseFloat(e.target.value));
      }
    }
  };
}
