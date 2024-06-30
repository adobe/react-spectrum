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

import {AriaColorAreaProps, ColorChannel} from '@react-types/color';
import {ColorAreaState} from '@react-stately/color';
import {DOMAttributes, RefObject} from '@react-types/shared';
import {focusWithoutScrolling, isAndroid, isIOS, mergeProps, useFormReset, useGlobalListeners, useLabels} from '@react-aria/utils';
// @ts-ignore
import intlMessages from '../intl/*.json';
import React, {ChangeEvent, InputHTMLAttributes, useCallback, useRef, useState} from 'react';
import {useColorAreaGradient} from './useColorAreaGradient';
import {useFocus, useFocusWithin, useKeyboard, useMove} from '@react-aria/interactions';
import {useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';
import {useVisuallyHidden} from '@react-aria/visually-hidden';

export interface ColorAreaAria {
  /** Props for the color area container element. */
  colorAreaProps: DOMAttributes,
  /** Props for the thumb element. */
  thumbProps: DOMAttributes,
  /** Props for the visually hidden horizontal range input element. */
  xInputProps: InputHTMLAttributes<HTMLInputElement>,
  /** Props for the visually hidden vertical range input element. */
  yInputProps: InputHTMLAttributes<HTMLInputElement>
}

export interface AriaColorAreaOptions extends AriaColorAreaProps {
  /** A ref to the input that represents the x axis of the color area. */
  inputXRef: RefObject<HTMLInputElement | null>,
  /** A ref to the input that represents the y axis of the color area. */
  inputYRef: RefObject<HTMLInputElement | null>,
  /** A ref to the color area containing element. */
  containerRef: RefObject<Element | null>
}

/**
 * Provides the behavior and accessibility implementation for a color area component.
 * Color area allows users to adjust two channels of an RGB, HSL or HSB color value against a two-dimensional gradient background.
 */
export function useColorArea(props: AriaColorAreaOptions, state: ColorAreaState): ColorAreaAria {
  let {
    isDisabled,
    inputXRef,
    inputYRef,
    containerRef,
    'aria-label': ariaLabel,
    xName,
    yName
  } = props;
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/color');

  let {addGlobalListener, removeGlobalListener} = useGlobalListeners();

  let {direction, locale} = useLocale();

  let [focusedInput, setFocusedInput] = useState<'x' | 'y' | null>(null);
  let focusInput = useCallback((inputRef:RefObject<HTMLInputElement | null> = inputXRef) => {
    if (inputRef.current) {
      focusWithoutScrolling(inputRef.current);
    }
  }, [inputXRef]);

  useFormReset(inputXRef, [state.xValue, state.yValue], ([x, y]) => {
    let newColor = state.value
      .withChannelValue(state.channels.xChannel, x)
      .withChannelValue(state.channels.yChannel, y);
    state.setValue(newColor);
  });

  let [valueChangedViaKeyboard, setValueChangedViaKeyboard] = useState(false);
  let [valueChangedViaInputChangeEvent, setValueChangedViaInputChangeEvent] = useState(false);
  let {xChannel, yChannel, zChannel} = state.channels;
  let xChannelStep = state.xChannelStep;
  let yChannelStep = state.yChannelStep;

  let currentPosition = useRef<{x: number, y: number} | null>(null);

  let {keyboardProps} = useKeyboard({
    onKeyDown(e) {
      // these are the cases that useMove doesn't handle
      if (!/^(PageUp|PageDown|Home|End)$/.test(e.key)) {
        e.continuePropagation();
        return;
      }
      // same handling as useMove, don't need to stop propagation, useKeyboard will do that for us
      e.preventDefault();
      // remember to set this and unset it so that onChangeEnd is fired
      state.setDragging(true);
      setValueChangedViaKeyboard(true);
      let dir;
      switch (e.key) {
        case 'PageUp':
          state.incrementY(state.yChannelPageStep);
          dir = 'y';
          break;
        case 'PageDown':
          state.decrementY(state.yChannelPageStep);
          dir = 'y';
          break;
        case 'Home':
          direction === 'rtl' ? state.incrementX(state.xChannelPageStep) : state.decrementX(state.xChannelPageStep);
          dir = 'x';
          break;
        case 'End':
          direction === 'rtl' ? state.decrementX(state.xChannelPageStep) : state.incrementX(state.xChannelPageStep);
          dir = 'x';
          break;
      }
      state.setDragging(false);
      if (dir) {
        let input = dir === 'x' ? inputXRef : inputYRef;
        focusInput(input);
        setFocusedInput(dir);
      }
    }
  });

  let moveHandler = {
    onMoveStart() {
      currentPosition.current = null;
      state.setDragging(true);
    },
    onMove({deltaX, deltaY, pointerType, shiftKey}) {
      let {
        incrementX,
        decrementX,
        incrementY,
        decrementY,
        xChannelPageStep,
        xChannelStep,
        yChannelPageStep,
        yChannelStep,
        getThumbPosition,
        setColorFromPoint
      } = state;
      if (currentPosition.current == null) {
        currentPosition.current = getThumbPosition();
      }
      let {width, height} = containerRef.current?.getBoundingClientRect() || {width: 0, height: 0};
      let valueChanged = deltaX !== 0 || deltaY !== 0;
      if (pointerType === 'keyboard') {
        let deltaXValue = shiftKey && xChannelPageStep > xChannelStep ? xChannelPageStep : xChannelStep;
        let deltaYValue = shiftKey && yChannelPageStep > yChannelStep ? yChannelPageStep : yChannelStep;
        if ((deltaX > 0 && direction === 'ltr') || (deltaX < 0 && direction === 'rtl')) {
          incrementX(deltaXValue);
        } else if ((deltaX < 0 && direction === 'ltr') || (deltaX > 0 && direction === 'rtl')) {
          decrementX(deltaXValue);
        } else if (deltaY > 0) {
          decrementY(deltaYValue);
        } else if (deltaY < 0) {
          incrementY(deltaYValue);
        }
        setValueChangedViaKeyboard(valueChanged);
        // set the focused input based on which axis has the greater delta
        focusedInput = valueChanged && Math.abs(deltaY) > Math.abs(deltaX) ? 'y' : 'x';
        setFocusedInput(focusedInput);
      } else {
        currentPosition.current.x += (direction === 'rtl' ? -1 : 1) * deltaX / width ;
        currentPosition.current.y += deltaY / height;
        setColorFromPoint(currentPosition.current.x, currentPosition.current.y);
      }
    },
    onMoveEnd() {
      isOnColorArea.current = false;
      state.setDragging(false);
      let input = focusedInput === 'x' ? inputXRef : inputYRef;
      focusInput(input);
    }
  };
  let {moveProps: movePropsThumb} = useMove(moveHandler);

  let {focusWithinProps} = useFocusWithin({
    onFocusWithinChange: (focusWithin:boolean) => {
      if (!focusWithin) {
        setValueChangedViaKeyboard(false);
        setValueChangedViaInputChangeEvent(false);
      }
    }
  });

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

  let onThumbDown = (id: number | null | undefined) => {
    if (!state.isDragging) {
      currentPointer.current = id;
      setValueChangedViaKeyboard(false);
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
      setValueChangedViaKeyboard(false);
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

  let onColorAreaDown = (colorArea: Element, id: number | null | undefined, clientX: number, clientY: number) => {
    let rect = colorArea.getBoundingClientRect();
    let {width, height} = rect;
    let x = (clientX - rect.x) / width;
    let y = (clientY - rect.y) / height;
    if (direction === 'rtl') {
      x = 1 - x;
    }
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1 && !state.isDragging && currentPointer.current === undefined) {
      isOnColorArea.current = true;
      setValueChangedViaKeyboard(false);
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
      setValueChangedViaKeyboard(false);
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
  }, focusWithinProps, keyboardProps, movePropsThumb);

  let {focusProps: xInputFocusProps} = useFocus({
    onFocus: () => {
      setFocusedInput('x');
    }
  });

  let {focusProps: yInputFocusProps} = useFocus({
    onFocus: () => {
      setFocusedInput('y');
    }
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {target} = e;
    setValueChangedViaInputChangeEvent(true);
    if (target === inputXRef.current) {
      state.setXValue(parseFloat(target.value));
    } else if (target === inputYRef.current) {
      state.setYValue(parseFloat(target.value));
    }
  };

  let isMobile = isIOS() || isAndroid();

  let value = state.getDisplayColor();
  const getAriaValueTextForChannel = useCallback((channel:ColorChannel) => {
    const isAfterInput = valueChangedViaInputChangeEvent || valueChangedViaKeyboard;
    return `${
      isAfterInput ?
      stringFormatter.format('colorNameAndValue', {name: value.getChannelName(channel, locale), value: value.formatChannelValue(channel, locale)})
      :
      [
        stringFormatter.format('colorNameAndValue', {name: value.getChannelName(channel, locale), value: value.formatChannelValue(channel, locale)}),
        stringFormatter.format('colorNameAndValue', {name: value.getChannelName(channel === yChannel ? xChannel : yChannel, locale), value: value.formatChannelValue(channel === yChannel ? xChannel : yChannel, locale)}),
        stringFormatter.format('colorNameAndValue', {name: value.getChannelName(zChannel, locale), value: value.formatChannelValue(zChannel, locale)})
      ].join(', ')
    }, ${value.getColorName(locale)}`;
  }, [locale, value, stringFormatter, valueChangedViaInputChangeEvent, valueChangedViaKeyboard, xChannel, yChannel, zChannel]);

  let colorPickerLabel = stringFormatter.format('colorPicker');

  let xInputLabellingProps = useLabels({
    ...props,
    'aria-label': ariaLabel ? stringFormatter.format('colorInputLabel', {label: ariaLabel, channelLabel: colorPickerLabel}) : colorPickerLabel
  });

  let yInputLabellingProps = useLabels({
    ...props,
    'aria-label': ariaLabel ? stringFormatter.format('colorInputLabel', {label: ariaLabel, channelLabel: colorPickerLabel}) : colorPickerLabel
  });

  let colorAreaLabellingProps = useLabels(
    {
      ...props,
      'aria-label': ariaLabel ? `${ariaLabel}, ${colorPickerLabel}` : undefined
    },
    isMobile ? colorPickerLabel : undefined
  );

  let ariaRoleDescription = stringFormatter.format('twoDimensionalSlider');

  let {visuallyHiddenProps} = useVisuallyHidden({style: {
    opacity: '0.0001',
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
  }});

  let {
    colorAreaStyleProps,
    thumbStyleProps
  } = useColorAreaGradient({
    direction,
    state,
    xChannel,
    yChannel,
    zChannel
  });

  return {
    colorAreaProps: {
      ...colorAreaLabellingProps,
      ...colorAreaInteractions,
      ...colorAreaStyleProps,
      role: 'group'
    },
    thumbProps: {
      ...thumbInteractions,
      ...thumbStyleProps,
      role: 'presentation'
    },
    xInputProps: {
      ...xInputLabellingProps,
      ...visuallyHiddenProps,
      ...xInputFocusProps,
      type: 'range',
      min: state.value.getChannelRange(xChannel).minValue,
      max: state.value.getChannelRange(xChannel).maxValue,
      step: xChannelStep,
      'aria-roledescription': ariaRoleDescription,
      'aria-valuetext': getAriaValueTextForChannel(xChannel),
      'aria-orientation': 'horizontal',
      'aria-describedby': props['aria-describedby'],
      'aria-details': props['aria-details'],
      disabled: isDisabled,
      value: state.value.getChannelValue(xChannel),
      name: xName,
      tabIndex: (isMobile || !focusedInput || focusedInput === 'x' ? undefined : -1),
      /*
        So that only a single "2d slider" control shows up when listing form elements for screen readers,
        add aria-hidden="true" to the unfocused control when the value has not changed via the keyboard,
        but remove aria-hidden to reveal the input for each channel when the value has changed with the keyboard.
      */
      'aria-hidden': (isMobile || !focusedInput || focusedInput === 'x' || valueChangedViaKeyboard ? undefined : 'true'),
      onChange
    },
    yInputProps: {
      ...yInputLabellingProps,
      ...visuallyHiddenProps,
      ...yInputFocusProps,
      type: 'range',
      min: state.value.getChannelRange(yChannel).minValue,
      max: state.value.getChannelRange(yChannel).maxValue,
      step: yChannelStep,
      'aria-roledescription': ariaRoleDescription,
      'aria-valuetext': getAriaValueTextForChannel(yChannel),
      'aria-orientation': 'vertical',
      'aria-describedby': props['aria-describedby'],
      'aria-details': props['aria-details'],
      disabled: isDisabled,
      value: state.value.getChannelValue(yChannel),
      name: yName,
      tabIndex: (isMobile || focusedInput === 'y' ? undefined : -1),
      /*
        So that only a single "2d slider" control shows up when listing form elements for screen readers,
        add aria-hidden="true" to the unfocused input when the value has not changed via the keyboard,
        but remove aria-hidden to reveal the input for each channel when the value has changed with the keyboard.
      */
      'aria-hidden': (isMobile || focusedInput === 'y' || valueChangedViaKeyboard ? undefined : 'true'),
      onChange
    }
  };
}
