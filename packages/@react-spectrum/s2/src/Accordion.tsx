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

import {AriaLabelingProps, DOMProps, DOMRef, DOMRefValue, forwardRefType} from '@react-types/shared';
import {Button, ContextValue, DisclosureStateContext, Heading, Provider, AccordionItem as RACAccordionItem, AccordionItemProps as RACAccordionItemProps, AccordionPanel as RACAccordionPanel, AccordionPanelProps as RACAccordionPanelProps, SlotProps} from 'react-aria-components';
import Chevron from '../ui-icons/Chevron';
import {Divider} from './Divider';
import {filterDOMProps} from '@react-aria/utils';
import {getAllowedOverrides, UnsafeStyles} from './style-utils' with { type: 'macro' };
import React, {createContext, forwardRef, useContext} from 'react';
import {size as sizeValue, style} from '../style/spectrum-theme' with { type: 'macro' };
import {StyleString} from '../style/types';
import {useDOMRef} from '@react-spectrum/utils';
import {useLocale} from '@react-aria/i18n';
import {useSpectrumContextProps} from './useSpectrumContextProps';


export interface AccordionGroupProps extends UnsafeStyles, DOMProps, SlotProps {
  /** The accordion items in the accordion group. */
  children: React.ReactNode,
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StyleString,
  /**
   * The size of the accordion.
   * @default "M"
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * The amount of space between the accordion items.
   * @default "regular"
   */
  density?: 'compact' | 'regular' | 'spacious',
  /** Whether the accordion should be displayed with a quiet style. */
  isQuiet?: boolean,
  /** Whether the accordion should be disabled. */
  isDisabled?: boolean
}

const groupStyles = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: sizeValue(200)
}, getAllowedOverrides());

export const AccordionGroupContext = createContext<ContextValue<AccordionGroupProps, DOMRefValue<HTMLDivElement>>>(null);

let InternalAccordionGroupContext = createContext<Pick<AccordionGroupProps, 'size'| 'isQuiet'| 'density' | 'isDisabled'>>({});

function AccordionGroup(props: AccordionGroupProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, AccordionGroupContext);
  let domRef = useDOMRef(ref);
  let {
    UNSAFE_style,
    UNSAFE_className = '',
    size = 'M',
    density = 'regular',
    isQuiet,
    isDisabled,
    ...otherProps
  } = props;
  const domProps = filterDOMProps(otherProps);
  return (
    <Provider
      values={[
        [InternalAccordionGroupContext, {size, isQuiet, density, isDisabled}]
      ]}>
      <div
        {...domProps}
        ref={domRef}
        style={UNSAFE_style}
        className={(UNSAFE_className ?? '') + groupStyles(null, props.styles)}>
        {props.children}
      </div>
    </Provider>
  );
}

/**
 * A accordion group is a container for multiple accordion items.
 */
let _AccordionGroup = /*#__PURE__*/ (forwardRef as forwardRefType)(AccordionGroup);
export {_AccordionGroup as AccordionGroup};

const itemStyles = style({
  color: 'heading',
  padding: '[2px]'
}, getAllowedOverrides());

export interface AccordionItemProps extends RACAccordionItemProps, UnsafeStyles, DOMProps {
  /** The contents of the accordion item, consisting of an AccordionHeader and AccordionPanel. */
  children: React.ReactNode,
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StyleString
}

export const AccordionItemContext = createContext<ContextValue<AccordionItemProps, DOMRefValue<HTMLDivElement>>>(null);

const lastDividerStyles = style({
  display: {
    default: 'none',
    ':last-child': 'block'
  }
});

function AccordionItem(props: AccordionItemProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, AccordionItemContext);
  let domRef = useDOMRef(ref);
  let {
    UNSAFE_style,
    UNSAFE_className = '',
    isDisabled,
    ...otherProps
  } = props;
  const domProps = filterDOMProps(otherProps);
  let {isQuiet, isDisabled: isGroupDisabled} = useContext(InternalAccordionGroupContext);
  return (
    <>
      {!isQuiet && <Divider size="S" />}
      <RACAccordionItem
        {...domProps}
        isDisabled={isDisabled || isGroupDisabled}
        ref={domRef}
        style={UNSAFE_style}
        className={(UNSAFE_className ?? '') + itemStyles(null, props.styles)}>
        {props.children}
      </RACAccordionItem>
      {!isQuiet && <Divider UNSAFE_className={lastDividerStyles} size="S" />}
    </>
  );
}

/**
 * A accordion item is a collapsible section of content. It is composed of a a header with a heading and trigger button, and a panel that contains the content.
 */
let _AccordionItem = /*#__PURE__*/ (forwardRef as forwardRefType)(AccordionItem);
export {_AccordionItem as AccordionItem};

export interface AccordionHeaderProps extends UnsafeStyles, DOMProps {
  children: React.ReactNode
}

const headingStyle = style({
  margin: 0
});

const buttonStyles = style({
  // Custom focus ring so it doesn't overlap divider
  outlineStyle: 'solid',
  outlineColor: {
    default: 'transparent',
    isHovered: 'transparent-black-100',
    isFocusVisible: 'focus-ring'
  },
  outlineWidth: 2,
  outlineOffset: 0,
  font: 'heading',
  color: {
    default: 'neutral',
    isDisabled: 'disabled'
  },
  fontWeight: 'bold',
  lineHeight: 'ui',
  display: 'flex',
  alignItems: 'center',
  paddingX: {
    size: {
      S: sizeValue(7),
      M: sizeValue(11),
      L: sizeValue(14),
      XL: sizeValue(17)
    }
  },
  paddingY: {
    size: {
      S: {
        density: {
          compact: sizeValue(2),
          regular: sizeValue(5),
          spacious: sizeValue(9)
        }
      },
      M: {
        density: {
          compact: 4,
          regular: 8,
          spacious: 12
        }
      },
      L: {
        density: {
          compact: 4,
          regular: sizeValue(9),
          spacious: 12
        }
      },
      XL: {
        density: {
          compact: sizeValue(5),
          regular: sizeValue(9),
          spacious: sizeValue(13)
        }
      }
    }
  },
  gap: {
    size: {
      S: sizeValue(7),
      M: sizeValue(11),
      L: sizeValue(14),
      XL: sizeValue(17)
    }
  },
  height: '[inherit]',
  minHeight: 'control',
  width: 'full',
  backgroundColor: {
    default: 'transparent',
    isFocusVisible: 'transparent-black-100',
    isHovered: 'transparent-black-100'
  },
  borderWidth: 0,
  borderRadius: {
    // Only rounded for keyboard focus and quiet hover.
    default: 'none',
    size: {
      S: {
        isFocusVisible: '[7px]',
        isQuiet: {
          isHovered: '[7px]',
          isFocusVisible: '[7px]'
        }
      },
      M: {
        isFocusVisible: 'default',
        isQuiet: {
          isHovered: 'default',
          isFocusVisible: 'default'
        }
      },
      L: {
        isFocusVisible: '[9px]',
        isQuiet: {
          isHovered: '[9px]',
          isFocusVisible: '[9px]'
        }
      },
      XL: {
        isFocusVisible: 'lg',
        isQuiet: {
          isHovered: 'lg',
          isFocusVisible: 'lg'
        }
      }
    }
  },
  textAlign: 'start',
  disableTapHighlight: true
});

const chevronStyles = style({
  rotate: {
    deg: 0,
    isExpanded: 90,
    isRTL: {
      deg: 180,
      isExpanded: 270
    }
  },
  transitionDuration: '100ms',
  transitionProperty: 'rotate',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  },
  flexShrink: 0
});

function AccordionHeader(props: AccordionHeaderProps, ref: DOMRef<HTMLDivElement>) {
  let {
    UNSAFE_style,
    UNSAFE_className = '',
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  const domProps = filterDOMProps(otherProps);
  let {direction} = useLocale();
  let {isExpanded} = useContext(DisclosureStateContext)!;
  let {size, density, isQuiet} = useContext(InternalAccordionGroupContext);
  let isRTL = direction === 'rtl';
  return (
    <Heading
      {...domProps}
      ref={domRef}
      style={UNSAFE_style}
      className={(UNSAFE_className ?? '') + headingStyle}>
      <Button className={({isHovered, isFocused, isFocusVisible, isDisabled}) => buttonStyles({size, isHovered, isFocused, isFocusVisible, density, isQuiet, isDisabled})} slot="trigger">
        <Chevron size={size} className={chevronStyles({isExpanded, isRTL})} aria-hidden="true" />
        {props.children}
      </Button>
    </Heading>
  );
}

/**
 * A header for an accordion item. Contains a heading and a trigger button to expand/collapse the panel.
 */
let _AccordionHeader = /*#__PURE__*/ (forwardRef as forwardRefType)(AccordionHeader);
export {_AccordionHeader as AccordionHeader};

export interface AccordionPanelProps extends RACAccordionPanelProps, UnsafeStyles, DOMProps, AriaLabelingProps {
  children: React.ReactNode
}

const panelStyles = style({
  font: 'body',
  height: 'auto',
  paddingTop: {
    isExpanded: sizeValue(8)
  },
  paddingBottom: {
    isExpanded: sizeValue(16)
  },
  paddingX: {
    isExpanded: {
      size: {
        S: sizeValue(8),
        M: sizeValue(9),
        L: sizeValue(12),
        XL: sizeValue(15)
      }
    }
  }
});

function AccordionPanel(props: AccordionPanelProps, ref: DOMRef<HTMLDivElement>) {
  let {
    UNSAFE_style,
    UNSAFE_className = '',
    ...otherProps
  } = props;
  const domProps = filterDOMProps(otherProps);
  let {size} = useContext(InternalAccordionGroupContext);
  let {isExpanded} = useContext(DisclosureStateContext)!;
  let panelRef = useDOMRef(ref);
  return (
    <RACAccordionPanel
      {...domProps}
      ref={panelRef}
      style={UNSAFE_style}
      className={(UNSAFE_className ?? '') + panelStyles({size, isExpanded})}>
      {props.children}
    </RACAccordionPanel>
  );
}

/**
 * A accordion item is a collapsible section of content. It is composed of a a header with a heading and trigger button, and a panel that contains the content.
 */
let _AccordionPanel = /*#__PURE__*/ (forwardRef as forwardRefType)(AccordionPanel);
export {_AccordionPanel as AccordionPanel};

