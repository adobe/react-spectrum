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
import {createContext, forwardRef, ReactNode, useContext, useRef} from 'react';
import {focusRing, StyleProps, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {size, style} from '../style/spectrum-theme' with {type: 'macro'};
import {centerBaseline} from './CenterBaseline';
import {IconContext} from './Icon';
import { useRadioGroupState } from 'react-stately';

interface SegmentedControlProps extends ValueBase<string|null, string>, InputDOMProps, FocusEvents, StyleProps, AriaLabelingProps {
  children?: ReactNode,
  /**
   * The style of the track.
   * 
   * @default 'none'
   */
  trackStyle?: 'none' | 'track',
  isDisabled?: boolean
}
interface ControlItemProps extends Omit<RadioProps, 'children'>, StyleProps {
  children?: ReactNode
}

const segmentedControl = style({
  fontFamily: 'sans',
  fontSize: 'control',
  display: 'flex',
  minWidth: {
    trackStyle: {
       // this is an arbitrary value. there is no minWidth in the tokens but the size of the each segment is dependent on the width of the segmented control so without it, it looks strange
      track: 240
    }
  }
}, getAllowedOverrides())

const controlItem = style({
  ...focusRing(),
  display: 'flex',
  gap: 'text-to-visual',
  color: {
    default: {
      trackStyle: {
        none: 'gray-600',
        track: 'gray-700'
      }
    },
    isHovered: 'neutral-subdued',
    isSelected: 'neutral',
    isDisabled: 'disabled',
    forcedColors: {
      isDisabled: 'GrayText'
    }
  },
  backgroundColor: {
    trackStyle: {
      none: {
        isSelected: {
          default: 'gray-100',
          isHovered: 'gray-200',
          isDisabled: 'disabled'
        },
        forcedColors: {
          isDisabled: {
            isSelected: 'GrayText'
          },
          isSelected: 'Highlight'
        }
      }, 
      track: {
        isSelected: {
          default: 'gray-25'
        },
        forcedColors: {
          isDisabled: {
            isSelected: 'GrayText'
          },
          isSelected: 'Highlight'
        }
      }
    },
  },
  // the padding should be a little less for segmented controls that only contain icons but not sure of a good way to do that
  paddingX: {
    trackStyle: {
      none: 12
    }
  },
  paddingY: 8,
  boxSizing: 'border-box',
  borderStyle: {
    trackStyle: {
      track: 'solid'
    }
  },
  borderWidth: {
    trackStyle: {
      track: 2
    }
  },
  borderColor: {
    trackStyle: {
      track: {
        default: 'transparent',
        isSelected: {
          default: 'gray-900',
          isDisabled: 'disabled'
        },
        forcedColors: {
          isDisabled: 'GrayText',
          isSelected: 'Highlight'
        }
      }
    }
  },
  borderRadius: 'lg',
  flexBasis: {
    trackStyle: {
      track: 0
    }
  },
  flexGrow: {
    trackStyle: {
      track: 1
    }
  },
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
}, getAllowedOverrides())

const controlWrapper = style({
  display: 'flex',
  backgroundColor: {
    trackStyle: {
      track: {
        default: 'gray-100'
      }
    }
  },
  borderRadius: 'lg',
  width: 'full'
})

const SegmentedControlInternalContext = createContext<SegmentedControlProps>({});

function SegmentedControl(props: SegmentedControlProps, ref: DOMRef<HTMLDivElement> ) {
  let domRef = useDOMRef(ref);
  let state = useRadioGroupState(props);
  console.log(state);

  return (
    <RadioGroup 
      {...props}
      ref={domRef}
      className={segmentedControl({trackStyle: props.trackStyle}, props.styles)} // DOUBLE CHECK THIS
      aria-label={props['aria-label'] || 'Segmented Control'}>
      <Provider
        values={[
          [SegmentedControlInternalContext, {trackStyle: props.trackStyle || 'none'}]
        ]}>
        <div className={controlWrapper({trackStyle: props.trackStyle})}>
          {props.children}
        </div>
      </Provider>
    </RadioGroup>
  )
}

function ControlItem(props: ControlItemProps, ref: FocusableRef<HTMLLabelElement>) {
  let inputRef = useRef<HTMLInputElement>(null);
  let domRef = useFocusableRef(ref, inputRef);
  let {trackStyle} = useContext(SegmentedControlInternalContext);

  return (
    <Radio 
      {...props} 
      ref={domRef} 
      inputRef={inputRef} 
      className={renderProps => controlItem({...renderProps, trackStyle}, props.styles)} >
      <Provider values={[
          [IconContext, {
            render: centerBaseline({slot: 'icon', className: style({order: 0, flexShrink: 0})}),
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