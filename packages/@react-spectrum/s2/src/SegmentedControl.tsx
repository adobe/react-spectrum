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

import {AriaLabelingProps,  DOMRef, FocusEvents, FocusableRef, InputDOMProps, ValueBase} from '@react-types/shared';
import {Radio, RadioGroup, RadioProps, Provider} from "react-aria-components"
import {useDOMRef, useFocusableRef} from '@react-spectrum/utils';
import {forwardRef, ReactNode, useRef} from 'react';
import {focusRing, StyleProps} from './style-utils' with {type: 'macro'};
import {size, style} from '../style/spectrum-theme' with {type: 'macro'};
import {centerBaseline} from './CenterBaseline';
import {IconContext} from './Icon';

interface SegmentedControlProps extends ValueBase<string|null, string>, InputDOMProps, FocusEvents, StyleProps, AriaLabelingProps {
  children?: ReactNode,
  trackStyle?: 'none' | 'track',
  isDisabled?: boolean
}
interface ControlItemProps extends Omit<RadioProps, 'children'> {
  children?: ReactNode
}

const segmentedControl = style({
  fontFamily: 'sans',
  fontSize: 'control',
  display: 'flex'
})

const controlItem = style({
  ...focusRing(),
  display: 'flex',
  gap: size(6),
  color: {
    default: 'gray-600',
    isHovered: 'neutral-subdued',
    isSelected: 'neutral',
    isDisabled: 'disabled'
  },
  backgroundColor: {
    isSelected: {
      default: 'gray-100',
      isHovered: 'gray-200',
      isDisabled: 'disabled'
    }
  },
  // the padding should be a little less for segmented controls that only contain icons but not sure of a good way to do that
  paddingX: 12,
  paddingY: 8,
  borderRadius: 'lg',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
})

function SegmentedControl(props: SegmentedControlProps, ref: DOMRef<HTMLDivElement> ) {
  let domRef = useDOMRef(ref);

  return (
    <RadioGroup 
      {...props}
      ref={domRef}
      className={segmentedControl}
      aria-label={props['aria-label'] || 'Segmented Control'}>
      {props.children}
    </RadioGroup>
  )
}

function ControlItem(props: ControlItemProps, ref: FocusableRef<HTMLLabelElement>) {
  let inputRef = useRef<HTMLInputElement>(null);
  let domRef = useFocusableRef(ref, inputRef);
  return (
    <Radio 
      {...props} 
      ref={domRef} 
      inputRef={inputRef} 
      className={renderProps => controlItem({...renderProps})} >
      <Provider values={[
          [IconContext, {
          render: centerBaseline({slot: 'icon', className: style({order: 0})}),
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
 * TODO: UPDATE
 */
const _SegmentedControl = /*#__PURE__*/ forwardRef(SegmentedControl)
export {_SegmentedControl as SegmentedControl};