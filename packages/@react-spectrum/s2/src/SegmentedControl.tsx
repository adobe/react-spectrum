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

import {AriaLabelingProps, DOMRef, DOMRefValue, FocusableRef, FocusEvents, InputDOMProps, ValueBase} from '@react-types/shared';
import {centerBaseline} from './CenterBaseline';
import {ContextValue, Provider, Radio, RadioGroup, RadioGroupStateContext, RadioProps} from 'react-aria-components';
import {createContext, forwardRef, ReactNode, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {focusRing, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {IconContext} from './Icon';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {useDOMRef, useFocusableRef} from '@react-spectrum/utils';
import {useLayoutEffect} from '@react-aria/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface SegmentedControlProps extends ValueBase<string|null, string>, InputDOMProps, FocusEvents, StyleProps, Omit<AriaLabelingProps, 'aria-label'> {
  /**
   * The content to display in the segmented control.
   */
  children?: ReactNode,
  /**
   * Whether the segmented control is disabled.
   */
  isDisabled?: boolean,
  /**
   * Defines a string value that labels the current element.
   */
  'aria-label': string
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
  width: 'full',
  zIndex: 1,
  position: 'relative'
}, getAllowedOverrides());

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
    }
  },
  // backgroundColor: {
  //   isSelected: 'gray-25',
  //   forcedColors: {
  //     isSelected: 'Highlight',
  //     isDisabled: {
  //       isSelected: 'GrayText'
  //     },
  //   },
  // },
  // the padding should be a little less for segmented controls that only contain icons but not sure of a good way to do that
  paddingX: 'edge-to-text',
  height: 32,
  alignItems: 'center',
  boxSizing: 'border-box',
  borderStyle: 'solid',
  borderColor: 'transparent',
  // borderWidth: 2,
  // borderColor: {
  //   default: 'transparent',
  //   isSelected: {
  //     default: 'gray-900',
  //     isDisabled: 'disabled'
  //   },
  //   forcedColors: {
  //     isDisabled: 'GrayText',
  //     isSelected: {
  //       default: 'Highlight',
  //       isDisabled: 'GrayText'
  //     }
  //   }
  // },
  borderRadius: 'control',
  flexBasis: 0,
  flexGrow: 1,
  flexShrink: 0,
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  },
  zIndex: 2
}, getAllowedOverrides());

interface InternalSegmentedControlContextProps extends SegmentedControlProps {
  register?: (value: string) => void
}

interface DefaultSelectionTrackProps {
  defaultValue?: string | null,
  value?: string | null,
  children?: ReactNode,
  domRef?
}

const InternalSegmentedControlContext = createContext<InternalSegmentedControlContextProps>({});

function SegmentedControl(props: SegmentedControlProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, SegmentedControlContext);
  let {
    defaultValue,
    value
  } = props;
  let domRef = useDOMRef(ref);

  return (
    <RadioGroup 
      {...props}
      ref={domRef}
      orientation="horizontal"
      style={props.UNSAFE_style}
      className={(props.UNSAFE_className || '') + segmentedControl({size: 'M'}, props.styles)}
      aria-label={props['aria-label']}>
      <DefaultSelectionTracker defaultValue={defaultValue} value={value} domRef={domRef} >
        {props.children}
      </DefaultSelectionTracker>
    </RadioGroup>
  );
}

function DefaultSelectionTracker(props: DefaultSelectionTrackProps) {
  let {
    domRef
  } = props;
  let state = useContext(RadioGroupStateContext);
  let isRegistered = useRef(!(props.defaultValue == null && props.value == null));
  let itemRef = useRef(null);

  let [style, setStyle] = useState<{transform: string | undefined, width: string | undefined, height: string | undefined}>({
    transform: undefined,
    width: undefined,
    height: undefined
  });

  // default select the first available item
  let register = useCallback((value: string) => {
    if (!isRegistered.current) {
      isRegistered.current = true;

      state.setSelectedValue(value);
    }
  }, []);

  // First: get the current bounds of the element
  useEffect(() => {
    if (domRef.current) {
      let item = domRef.current.querySelector('label[data-selected=true]');
      itemRef.current = item;

      // i don't really want to have this here, and honestly, it should probably go in useLayoutEffect
      // however, then i basically have to pull all the code currently in useEffect to useLayoutEffect which feels repetitive so I'm just keeping it here for now
      let styleObj: { transform: string | undefined, width: string | undefined, height: string | undefined } = {
        transform: undefined,
        width: undefined,
        height: undefined
      };

      let finalW = item?.offsetWidth;
      let finalH = item?.offsetHeight;

      styleObj.width = finalW;
      styleObj.height = finalH;
      setStyle(styleObj);

    }
  }, [state?.selectedValue]);

  // Last: get the final bounds of the element
  useLayoutEffect(() => {
    if (domRef.current) {
      let slide = document.querySelector('#animate');
      let item = domRef.current.querySelector('label[data-selected=true]');
      // let cachedItem = itemRef?.current?.getBoundingClientRect();


      if (itemRef.current) {
        // let finalItem = item.getBoundingClientRect();

        // Invert: determine the delta between the first and last bounds of the element
        // let deltaX = cachedItem.left - finalItem.left;
        // let deltaW = cachedItem.width / finalItem.width;
        // let deltaW = finalItem.width / cachedItem.width;
        // let deltaH = cachedItem.height / finalItem.height;
        // let cachedX = itemRef?.current.offsetLeft;
        let finalX = item.offsetLeft;
        // let finalW = item.offsetWidth;
        // let finalH = item.offsetHeight;

        // styleObj.width = finalW;
        // styleObj.height = finalH;
        // setStyle(styleObj);
        
        // Play: animate the final element from its first bounds to its last bound
        slide.animate(
          [
            {transform: `translateX(${finalX}px)`}
          ],
          {
            duration: 150,
            easing: 'ease-in',
            fill: 'forwards'
          }
        );
      }
    }
  }, [state?.selectedValue]);


  // style={{transform: move ? `translateX(100px)` : 'translateX(0px)'}}
  // style={{transform: 'translateX(120px)'}}
  return (
    <Provider
      values={[
        [InternalSegmentedControlContext, {register: register, 'aria-label': props['aria-label']}]
      ]}>
      {props.children}
      <span style={style} id="animate" className={test} /> 
    </Provider>
  );
}

const test = style({
  backgroundColor: 'gray-25',
  width: 56,
  height: 32,
  position: 'absolute',
  boxSizing: 'border-box',
  borderStyle: 'solid',
  borderWidth: 2,
  borderColor: 'gray-900',
  borderRadius: 'lg',
  zIndex: 1
});

function ControlItem(props: ControlItemProps, ref: FocusableRef<HTMLLabelElement>) {
  let inputRef = useRef<HTMLInputElement>(null);
  let domRef = useFocusableRef(ref, inputRef);
  let {register} = useContext(InternalSegmentedControlContext);
  let {isDisabled: isRadioGroupDisabled} = useContext(RadioGroupStateContext);

  useEffect(() => {
    if (!props.isDisabled && !isRadioGroupDisabled) {
      register(props.value);
    }
  }, []);

  return (
    <Radio 
      {...props} 
      ref={domRef} 
      inputRef={inputRef}
      style={props.UNSAFE_style}
      className={renderProps => (props.UNSAFE_className || '') + controlItem({...renderProps}, props.styles)} >
      <Provider 
        values={[
          [IconContext, {
            render: centerBaseline({slot: 'icon', styles: style({order: 0, flexShrink: 0})})
          }]
        ]}>
        {props.children}
      </Provider>
    </Radio>
  );
}

/**
 * A control items represents an individual control within a segmented control.
 */
const _ControlItem = /*#__PURE__*/ forwardRef(ControlItem);
export {_ControlItem as ControlItem};

/**
 * A segmented control is a mutually exclusive group of buttons, with or without a track.
 */
const _SegmentedControl = /*#__PURE__*/ forwardRef(SegmentedControl);
export {_SegmentedControl as SegmentedControl};
