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
import {baseColor, focusRing, style} from '../style' with {type: 'macro'};
import {centerBaseline} from './CenterBaseline';
import {ContextValue, DEFAULT_SLOT, Provider, TextContext as RACTextContext, SelectionIndicator, SlotProps, ToggleButton, ToggleButtonGroup, ToggleButtonRenderProps, ToggleGroupStateContext} from 'react-aria-components';
import {control, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {createContext, forwardRef, ReactNode, useCallback, useContext, useRef} from 'react';
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

export const SegmentedControlContext = createContext<ContextValue<Partial<SegmentedControlProps>, DOMRefValue<HTMLDivElement>>>(null);

const segmentedControl = style({
  display: 'flex',
  gap: 4,
  backgroundColor: 'gray-100',
  borderRadius: 'default',
  width: 'fit'
}, getAllowedOverrides());

const controlItem = style<ToggleButtonRenderProps & {isJustified?: boolean}>({
  ...focusRing(),
  ...control({shape: 'default', icon: true}),
  justifyContent: 'center',
  position: 'relative',
  forcedColorAdjust: 'none',
  color: {
    default: baseColor('neutral-subdued'),
    isSelected: baseColor('neutral'),
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonText',
      isDisabled: 'GrayText',
      isSelected: 'HighlightText'
    }
  },
  flexGrow: {
    isJustified: 1
  },
  flexBasis: {
    isJustified: 0
  },
  flexShrink: 0,
  whiteSpace: 'nowrap',
  disableTapHighlight: true,
  userSelect: 'none',
  backgroundColor: 'transparent',
  borderStyle: 'none',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  },
  // The selected item has lower z-index so that the sliding background
  // animation does not cover other items.
  zIndex: {
    default: 1,
    isSelected: 0
  }
}, getAllowedOverrides());

const slider = style<{isDisabled: boolean}>({
  backgroundColor: {
    default: 'gray-25',
    forcedColors: {
      default: 'Highlight',
      isDisabled: 'GrayText'
    }
  },
  top: 0,
  left: 0,
  width: 'full',
  height: 'full',
  contain: 'strict',
  transition: {
    default: '[translate,width]',
    '@media (prefers-reduced-motion: reduce)': 'none'
  },
  transitionDuration: 200,
  transitionTimingFunction: 'out',
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
  isJustified?: boolean
}

interface DefaultSelectionTrackProps {
  defaultValue?: Key | null,
  value?: Key | null,
  children: ReactNode,
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

  let onChange = (values: Set<Key>) => {
    if (onSelectionChange) {
      let firstKey = values.values().next().value;
      if (firstKey != null) {
        onSelectionChange(firstKey);
      }
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
      <DefaultSelectionTracker defaultValue={defaultSelectedKey} value={selectedKey} isJustified={props.isJustified}>
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Provider
      values={[
        [InternalSegmentedControlContext, {register: register, isJustified: props.isJustified}]
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
  let {register, isJustified} = useContext(InternalSegmentedControlContext);

  useLayoutEffect(() => {
    register?.(props.id);
  }, [register, props.id]);

  return (
    <ToggleButton
      {...props}
      ref={domRef}
      style={props.UNSAFE_style}
      className={renderProps => (props.UNSAFE_className || '') + controlItem({...renderProps, isJustified}, props.styles)} >
      {({isPressed, isDisabled}) => (
        <>
          <SelectionIndicator className={slider({isDisabled})} />
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
