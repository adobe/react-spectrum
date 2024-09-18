/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {centerBaseline} from './CenterBaseline';
import {ContextValue, DEFAULT_SLOT, Provider, TextContext as RACTextContext, Radio, RadioGroup, RadioGroupProps, RadioGroupStateContext, RadioProps} from 'react-aria-components';
import {createContext, forwardRef, ReactNode, RefObject, useCallback, useContext, useRef} from 'react';
import {DOMRef, DOMRefValue, FocusableRef} from '@react-types/shared';
import {focusRing, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {IconContext} from './Icon';
import {pressScale} from './pressScale';
import {size, style} from '../style/spectrum-theme' with {type: 'macro'};
import {Text, TextContext} from './Content';
import {useDOMRef, useFocusableRef} from '@react-spectrum/utils';
import {useLayoutEffect} from '@react-aria/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface SegmentedControlProps extends Omit<RadioGroupProps, 'isReadOnly' | 'name' | 'isRequired' | 'isInvalid' | 'validate' | 'validationBehavior' | 'children' | 'className' | 'style' | 'aria-label' | 'orientation'>, StyleProps{
  /**
   * The content to display in the segmented control.
   */
  children: ReactNode,
  /**
   * Whether the segmented control is disabled.
   */
  isDisabled?: boolean,
  /**
   * Defines a string value that labels the current element.
   */
  'aria-label': string
}
export interface SegmentedControlItemProps extends Omit<RadioProps, 'children' | 'className' | 'style' | 'onHoverStart' | 'onHoverEnd' | 'onHoverChange'>, StyleProps {
  /**
   * The content to display in the control item.
   */
  children: ReactNode
}

export const SegmentedControlContext = createContext<ContextValue<SegmentedControlProps, DOMRefValue<HTMLDivElement>>>(null);

const segmentedControl = style<{size: string}>({
  font: 'control',
  display: 'flex',
  backgroundColor: 'gray-100',
  borderRadius: 'lg',
  width: 'full'
}, getAllowedOverrides());

const controlItem = style({
  position: 'relative',
  display: 'flex',
  forcedColorAdjust: 'none',
  color: {
    default: 'gray-700',
    isHovered: 'neutral-subdued',
    isSelected: 'neutral',
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonText',
      isDisabled: 'GrayText',
      isSelected: 'HighlightText'
    }
  },
  // TODO: update this padding for icon-only items when we introduce the non-track style back
  paddingX: {
    default: 'edge-to-text',
    ':has([slot=icon]:only-child)': size(6)
  },
  height: 32,
  alignItems: 'center',
  flexBasis: 0,
  flexGrow: 1,
  flexShrink: 0,
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  disableTapHighlight: true,
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
}, getAllowedOverrides());

const slider = style({
  ...focusRing(),
  backgroundColor: 'gray-25',
  left: 0,
  width: 'full',
  height: 'full',
  position: 'absolute',
  boxSizing: 'border-box',
  borderStyle: 'solid',
  borderWidth: 2,
  borderColor: {
    default: 'gray-900',
    isDisabled: 'disabled'
  },
  borderRadius: 'lg'
});

interface InternalSegmentedControlContextProps {
  register?: (value: string, isDisabled?: boolean) => void,
  prevRef?: RefObject<DOMRect | null>,
  currentSelectedRef?: RefObject<HTMLDivElement | null>
}

interface DefaultSelectionTrackProps {
  defaultValue?: string | null,
  value?: string | null,
  children?: ReactNode,
  prevRef: RefObject<DOMRect | null>,
  currentSelectedRef: RefObject<HTMLDivElement | null>
}

const InternalSegmentedControlContext = createContext<InternalSegmentedControlContextProps>({});

function SegmentedControl(props: SegmentedControlProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, SegmentedControlContext);
  let {
    defaultValue,
    value
  } = props;
  let domRef = useDOMRef(ref);

  let prevRef = useRef<DOMRect>(null);
  let currentSelectedRef = useRef<HTMLDivElement>(null);

  let onChange = (value: string) => {
    if (currentSelectedRef.current) {
      prevRef.current = currentSelectedRef?.current.getBoundingClientRect();
    }
    
    if (props.onChange) {
      props.onChange(value);
    }
  };

  return (
    <RadioGroup 
      {...props}
      ref={domRef}
      orientation="horizontal"
      style={props.UNSAFE_style}
      onChange={onChange}
      className={(props.UNSAFE_className || '') + segmentedControl({size: 'M'}, props.styles)}
      aria-label={props['aria-label']}>
      <DefaultSelectionTracker defaultValue={defaultValue} value={value} prevRef={prevRef} currentSelectedRef={currentSelectedRef}>
        {props.children}
      </DefaultSelectionTracker>
    </RadioGroup>
  );
}

function DefaultSelectionTracker(props: DefaultSelectionTrackProps) {
  let state = useContext(RadioGroupStateContext);
  let isRegistered = useRef(!(props.defaultValue == null && props.value == null));

  // default select the first available item
  let register = useCallback((value: string) => {
    if (state && !isRegistered.current) {
      isRegistered.current = true;
      state.setSelectedValue(value);
    }
  }, []);

  return (
    <Provider
      values={[
        [InternalSegmentedControlContext, {register: register, prevRef: props.prevRef, currentSelectedRef: props.currentSelectedRef}]
      ]}> 
      {props.children}
    </Provider>
  );
}

function SegmentedControlItem(props: SegmentedControlItemProps, ref: FocusableRef<HTMLLabelElement>) {
  let inputRef = useRef<HTMLInputElement>(null);
  let domRef = useFocusableRef(ref, inputRef);
  let divRef = useRef<HTMLDivElement>(null);
  let {register, prevRef, currentSelectedRef} = useContext(InternalSegmentedControlContext);
  let state = useContext(RadioGroupStateContext);
  let isSelected = props.value === state?.selectedValue;
  // do not apply animation if a user has the prefers-reduced-motion setting
  let isReduced = false;
  if (window?.matchMedia) {
    isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  useLayoutEffect(() => {
    register?.(props.value);
  }, []);

  useLayoutEffect(() => {
    if (isSelected && prevRef?.current && currentSelectedRef?.current && !isReduced) {
      let currentItem = currentSelectedRef?.current.getBoundingClientRect();

      let deltaX = prevRef?.current.left - currentItem?.left;

      currentSelectedRef.current.animate(
        [
          {transform: `translateX(${deltaX}px)`, width: `${prevRef?.current.width}px`},
          {transform: 'translateX(0px)', width: `${currentItem.width}px`}
        ],
        {
          duration: 200,
          easing: 'ease-out'
        }
      );

      prevRef.current = null;
    }
  }, [isSelected]);

  return (
    <Radio 
      {...props} 
      ref={domRef} 
      inputRef={inputRef}
      style={props.UNSAFE_style}
      className={renderProps => (props.UNSAFE_className || '') + controlItem({...renderProps}, props.styles)} >
      {({isSelected, isFocusVisible, isPressed, isDisabled}) => (
        <>
          {isSelected && <div className={slider({isFocusVisible, isDisabled})} ref={currentSelectedRef} />}
          <Provider 
            values={[
              [IconContext, {
                render: centerBaseline({slot: 'icon', styles: style({order: 0, flexShrink: 0})})
              }],
              [RACTextContext, {slots: {[DEFAULT_SLOT]: {}}}],
              [TextContext, {styles: style({order: 1, truncate: true})}]
            ]}>
            <div ref={divRef} style={pressScale(divRef)({isPressed})} className={style({zIndex: 1, display: 'flex', gap: 'text-to-visual', transition: 'default', alignItems: 'center'})}>
              {typeof props.children === 'string' ? <Text>{props.children}</Text> : props.children}
            </div>
          </Provider>
        </>
      )
      }
    </Radio>
  );
}

/**
 * A control items represents an individual control within a segmented control.
 */
const _SegmentedControlItem = /*#__PURE__*/ forwardRef(SegmentedControlItem);
export {_SegmentedControlItem as SegmentedControlItem};

/**
 * A segmented control is a mutually exclusive group of buttons, with or without a track.
 */
const _SegmentedControl = /*#__PURE__*/ forwardRef(SegmentedControl);
export {_SegmentedControl as SegmentedControl};
