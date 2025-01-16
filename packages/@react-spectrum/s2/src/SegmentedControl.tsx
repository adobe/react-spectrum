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

import {AriaLabelingProps, DOMRef, DOMRefValue, FocusableRef, Key} from '@react-types/shared';
import {centerBaseline} from './CenterBaseline';
import {ContextValue, DEFAULT_SLOT, Provider, TextContext as RACTextContext, SlotProps, ToggleButton, ToggleButtonGroup, ToggleGroupStateContext} from 'react-aria-components';
import {createContext, forwardRef, ReactNode, RefObject, useCallback, useContext, useRef} from 'react';
import {focusRing, space, style} from '../style' with {type: 'macro'};
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {IconContext} from './Icon';
import {pressScale} from './pressScale';
import {Text, TextContext} from './Content';
import {useDOMRef, useFocusableRef} from '@react-spectrum/utils';
import {useLayoutEffect} from '@react-aria/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface SegmentedControlProps extends AriaLabelingProps, StyleProps, SlotProps {
  /**
   * The content to display in the segmented control.
   */
  children: ReactNode,
  /**
   * Whether the segmented control is disabled.
   */
  isDisabled?: boolean,
  /** Whether the items should divide the container width equally. */
  isJustified?: boolean,
  /** The id of the currently selected item (controlled). */
  selectedKey?: Key | null,
  /** The id of the initial selected item (uncontrolled). */
  defaultSelectedKey?: Key,
  /** Handler that is called when the selection changes. */
  onSelectionChange?: (id: Key) => void
}
export interface SegmentedControlItemProps extends AriaLabelingProps, StyleProps {
  /**
   * The content to display in the segmented control item.
   */
  children: ReactNode,
  /** The id of the item, matching the value used in SegmentedControl's `selectedKey` prop. */
  id: Key,
  /** Whether the item is disabled or not. */
  isDisabled?: boolean
}

export const SegmentedControlContext = createContext<ContextValue<SegmentedControlProps, DOMRefValue<HTMLDivElement>>>(null);

const segmentedControl = style({
  display: 'flex',
  gap: 4,
  backgroundColor: 'gray-100',
  borderRadius: 'default',
  width: 'fit'
}, getAllowedOverrides());

const controlItem = style({
  ...focusRing(),
  position: 'relative',
  display: 'flex',
  forcedColorAdjust: 'none',
  font: 'control',
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
    ':has([slot=icon]):not(:has([data-rsp-slot=text]))': space(6)
  },
  height: 32,
  alignItems: 'center',
  flexGrow: {
    isJustified: 1
  },
  flexBasis: {
    isJustified: 0
  },
  flexShrink: 0,
  minWidth: 0,
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  disableTapHighlight: true,
  userSelect: 'none',
  backgroundColor: 'transparent',
  borderStyle: 'none',
  borderRadius: 'default',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
}, getAllowedOverrides());

const slider = style({
  backgroundColor: {
    default: 'gray-25',
    forcedColors: {
      default: 'Highlight',
      isDisabled: 'GrayText'
    }
  },
  left: 0,
  width: 'full',
  height: 'full',
  position: 'absolute',
  boxSizing: 'border-box',
  borderStyle: 'solid',
  borderWidth: 2,
  borderColor: {
    default: 'gray-900',
    isDisabled: 'disabled',
    forcedColors: {
      default: 'Highlight',
      isDisabled: 'GrayText'
    }
  },
  borderRadius: 'lg'
});

interface InternalSegmentedControlContextProps {
  register?: (value: Key, isDisabled?: boolean) => void,
  prevRef?: RefObject<DOMRect | null>,
  currentSelectedRef?: RefObject<HTMLDivElement | null>,
  isJustified?: boolean
}

interface DefaultSelectionTrackProps {
  defaultValue?: Key | null,
  value?: Key | null,
  children?: ReactNode,
  prevRef: RefObject<DOMRect | null>,
  currentSelectedRef: RefObject<HTMLDivElement | null>,
  isJustified?: boolean
}

const InternalSegmentedControlContext = createContext<InternalSegmentedControlContextProps>({});

/**
 * A SegmentedControl is a mutually exclusive group of buttons used for view switching.
 */
export const SegmentedControl = /*#__PURE__*/ forwardRef(function SegmentedControl(props: SegmentedControlProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, SegmentedControlContext);
  let {
    defaultSelectedKey,
    selectedKey,
    onSelectionChange
  } = props;
  let domRef = useDOMRef(ref);

  let prevRef = useRef<DOMRect>(null);
  let currentSelectedRef = useRef<HTMLDivElement>(null);

  let onChange = (values: Set<Key>) => {
    if (currentSelectedRef.current) {
      prevRef.current = currentSelectedRef?.current.getBoundingClientRect();
    }
    
    if (onSelectionChange) {
      onSelectionChange(values.values().next().value);
    }
  };

  return (
    <ToggleButtonGroup 
      {...props}
      selectedKeys={selectedKey != null ? [selectedKey] : undefined}
      defaultSelectedKeys={defaultSelectedKey != null ? [defaultSelectedKey] : undefined}
      disallowEmptySelection
      ref={domRef}
      orientation="horizontal"
      style={props.UNSAFE_style}
      onSelectionChange={onChange}
      className={(props.UNSAFE_className || '') + segmentedControl(null, props.styles)}
      aria-label={props['aria-label']}>
      <DefaultSelectionTracker defaultValue={defaultSelectedKey} value={selectedKey} prevRef={prevRef} currentSelectedRef={currentSelectedRef} isJustified={props.isJustified}>
        {props.children}
      </DefaultSelectionTracker>
    </ToggleButtonGroup>
  );
});

function DefaultSelectionTracker(props: DefaultSelectionTrackProps) {
  let state = useContext(ToggleGroupStateContext);
  let isRegistered = useRef(!(props.defaultValue == null && props.value == null));

  // default select the first available item
  let register = useCallback((value: Key) => {
    if (state && !isRegistered.current) {
      isRegistered.current = true;
      state.toggleKey(value);
    }
  }, []);

  return (
    <Provider
      values={[
        [InternalSegmentedControlContext, {register: register, prevRef: props.prevRef, currentSelectedRef: props.currentSelectedRef, isJustified: props.isJustified}]
      ]}> 
      {props.children}
    </Provider>
  );
}

/**
 * A SegmentedControlItem represents an option within a SegmentedControl.
 */
export const SegmentedControlItem = /*#__PURE__*/ forwardRef(function SegmentedControlItem(props: SegmentedControlItemProps, ref: FocusableRef<HTMLButtonElement>) {
  let domRef = useFocusableRef(ref);
  let divRef = useRef<HTMLDivElement>(null);
  let {register, prevRef, currentSelectedRef, isJustified} = useContext(InternalSegmentedControlContext);
  let state = useContext(ToggleGroupStateContext);
  let isSelected = state?.selectedKeys.has(props.id);
  // do not apply animation if a user has the prefers-reduced-motion setting
  let isReduced = false;
  if (window?.matchMedia) {
    isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  useLayoutEffect(() => {
    register?.(props.id);
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
    <ToggleButton 
      {...props}
      ref={domRef} 
      style={props.UNSAFE_style}
      className={renderProps => (props.UNSAFE_className || '') + controlItem({...renderProps, isJustified}, props.styles)} >
      {({isSelected, isPressed, isDisabled}) => (
        <>
          {isSelected && <div className={slider({isDisabled})} ref={currentSelectedRef} />}
          <Provider 
            values={[
              [IconContext, {
                render: centerBaseline({slot: 'icon', styles: style({order: 0, flexShrink: 0})})
              }],
              [RACTextContext, {slots: {[DEFAULT_SLOT]: {}}}],
              [TextContext, {styles: style({order: 1, truncate: true})}]
            ]}>
            <div ref={divRef} style={pressScale(divRef)({isPressed})} className={style({display: 'flex', gap: 'text-to-visual', transition: 'default', alignItems: 'center', minWidth: 0})}>
              {typeof props.children === 'string' ? <Text>{props.children}</Text> : props.children}
            </div>
          </Provider>
        </>
      )
      }
    </ToggleButton>
  );
});
