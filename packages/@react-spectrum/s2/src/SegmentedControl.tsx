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

import {AriaLabelingProps, DOMRef, DOMRefValue, FocusEvents, FocusableRef, InputDOMProps, ValueBase} from '@react-types/shared';
import {centerBaseline} from './CenterBaseline';
import {ContextValue, Radio, RadioGroup, RadioProps, Provider, RadioGroupStateContext, useSlottedContext} from "react-aria-components"
import {createContext, forwardRef, ReactNode, useContext, useRef, useCallback, useEffect} from 'react';
import {focusRing, StyleProps, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {IconContext} from './Icon';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {useDOMRef, useFocusableRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface SegmentedControlProps extends ValueBase<string|null, string>, InputDOMProps, FocusEvents, StyleProps, AriaLabelingProps {
  /**
   * The content to display in the segmented control.
   */
  children?: ReactNode,
  /**
   * Whether the segmented control is disabled.
   */
  isDisabled?: boolean
}
export interface ControlItemProps extends Omit<RadioProps, 'children' | 'className' | 'style' | 'onHoverStart' | 'onHoverEnd' | 'onHoverChange'>, StyleProps {
  /**
   * The content to display in the control item. 
   */
  children?: ReactNode
}

export const SegmentedControlContext = createContext<ContextValue<SegmentedControlProps, DOMRefValue<HTMLDivElement>>>(null);

const segmentedControl = style<{size: string}>({
  font: 'control',
  display: 'flex',
  backgroundColor: 'gray-100',
  borderRadius: 'lg',
  width: 'full'
}, getAllowedOverrides())

const controlItem = style({
  ...focusRing(),
  display: 'flex',
  gap: 'text-to-visual',
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
    },
  },
  backgroundColor: {
    isSelected: 'gray-25',
    forcedColors: {
      isSelected: 'Highlight',
      isDisabled: {
        isSelected: 'GrayText'
      },
    },
  },
  // the padding should be a little less for segmented controls that only contain icons but not sure of a good way to do that
  paddingX: 'edge-to-text',
  height: 32,
  alignItems: 'center',
  boxSizing: 'border-box',
  borderStyle: 'solid',
  borderWidth: 2,
  borderColor: {
    default: 'transparent',
    isSelected: {
      default: 'gray-900',
      isDisabled: 'disabled'
    },
    forcedColors: {
      isDisabled: 'GrayText',
      isSelected: {
        default: 'Highlight',
        isDisabled: 'GrayText'
      }
    }
  },
  borderRadius: 'control',
  flexBasis: 0,
  flexGrow: 1,
  flexShrink: 0,
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
}, getAllowedOverrides())

interface SegmentedControlInternalContextProps extends SegmentedControlProps {
  register?: (value: string) => void;
}

interface DefaultSelectionTrackProps {
  defaultValue?: string,
  value?: string,
  children?: ReactNode
}

const SegmentedControlInternalContext = createContext<SegmentedControlInternalContextProps>({});

function SegmentedControl(props: SegmentedControlProps, ref: DOMRef<HTMLDivElement> ) {
  [props, ref] = useSpectrumContextProps(props, ref, SegmentedControlContext);
  let {
    defaultValue,
    value
  } = props
  let domRef = useDOMRef(ref);

  return (
    <RadioGroup 
      {...props}
      ref={domRef}
      style={props.UNSAFE_style}
      className={(props.UNSAFE_className || '') + segmentedControl({size: 'M'}, props.styles)}
      aria-label={props['aria-label'] || 'Segmented Control'}>
      <DefaultSelectionTracker defaultValue={defaultValue} value={value}>
        {props.children}
      </DefaultSelectionTracker>
    </RadioGroup>
  )
}

function DefaultSelectionTracker(props: DefaultSelectionTrackProps) {
  let state = useContext(RadioGroupStateContext);
  let isRegistered = useRef(!(props.defaultValue == null && props.value == null));

  let register = useCallback((value: string) => {
    if (!isRegistered.current) {
      isRegistered.current = true;

      state.setSelectedValue(value);
    }
  }, [])

  return (
    <Provider
      values={[
        [SegmentedControlInternalContext, {register: register}]
    ]}>
      {props.children}
    </Provider>
  )
}

function ControlItem(props: ControlItemProps, ref: FocusableRef<HTMLLabelElement>) {
  let inputRef = useRef<HTMLInputElement>(null);
  let domRef = useFocusableRef(ref, inputRef);
  let {register} = useContext(SegmentedControlInternalContext);
  let {isDisabled: isRadioGroupDisabled} = useContext(RadioGroupStateContext);

  useEffect(() => {
    if (!props.isDisabled && !isRadioGroupDisabled) {
      register(props.value)
    }
  }, [])

  return (
    <Radio 
      {...props} 
      ref={domRef} 
      inputRef={inputRef}
      style={props.UNSAFE_style}
      className={renderProps => (props.UNSAFE_className || '') + controlItem({...renderProps}, props.styles)} >
      <Provider values={[
          [IconContext, {
            render: centerBaseline({slot: 'icon', styles: style({order: 0, flexShrink: 0})}),
        }], 
      ]}>
        {props.children}
      </Provider>
    </Radio>
  )
}

/**
 * A control items represents an individual control within a segmented control.
 */
const _ControlItem = /*#__PURE__*/ forwardRef(ControlItem)
export {_ControlItem as ControlItem};

/**
 * A segmented control is a mutually exclusive group of buttons, with or without a track.
 */
const _SegmentedControl = /*#__PURE__*/ forwardRef(SegmentedControl)
export {_SegmentedControl as SegmentedControl};
