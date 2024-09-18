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
import {Button, ContextValue, DisclosureStateContext, Heading, Provider, Disclosure as RACDisclosure, DisclosurePanel as RACDisclosurePanel, DisclosurePanelProps as RACDisclosurePanelProps, DisclosureProps as RACDisclosureProps, SlotProps, useLocale} from 'react-aria-components';
import Chevron from '../ui-icons/Chevron';
import {filterDOMProps} from '@react-aria/utils';
import {focusRing, getAllowedOverrides, UnsafeStyles} from './style-utils' with { type: 'macro' };
import {fontRelative, size as sizeValue, style} from '../style/spectrum-theme' with { type: 'macro' };
import React, {createContext, forwardRef, ReactElement, useContext} from 'react';
import {StyleString} from '../style/types';
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';


export interface AccordionProps extends UnsafeStyles, DOMProps, SlotProps {
  /** The disclosure elements in the accordion. */
  children: React.ReactNode,
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StyleString,
  /**
   * The size of the accordion.
   * @default "M"
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * The amount of space between the disclosure items.
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
  flexDirection: 'column'
}, getAllowedOverrides());

export const AccordionContext = createContext<ContextValue<AccordionProps, DOMRefValue<HTMLDivElement>>>(null);

let InternalAccordionContext = createContext<Pick<AccordionProps, 'size'| 'isQuiet'| 'density' | 'isDisabled'>>({});

function Accordion(props: AccordionProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, AccordionContext);
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
        [InternalAccordionContext, {size, isQuiet, density, isDisabled}]
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
 * An accordion is a container for multiple disclosures.
 */
let _Accordion = /*#__PURE__*/ (forwardRef as forwardRefType)(Accordion);
export {_Accordion as Accordion};

export interface DisclosureProps extends RACDisclosureProps, UnsafeStyles, DOMProps {
  /**
   * The size of the disclosure.
   * @default "M"
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * The amount of space between the disclosures.
   * @default "regular"
   */
  density?: 'compact' | 'regular' | 'spacious',
  /** Whether the disclosure should be displayed with a quiet style. */
  isQuiet?: boolean,
  /** The contents of the disclosure, consisting of an DisclosureHeader and DisclosurePanel. */
  children: [ReactElement<DisclosureHeaderProps>, ReactElement<DisclosurePanelProps>],
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StyleString
}

export const DisclosureContext = createContext<ContextValue<DisclosureProps, DOMRefValue<HTMLDivElement>>>(null);

let InternalDisclosureContext = createContext<Pick<DisclosureProps, 'size'| 'isQuiet'| 'density' | 'isDisabled'>>({});

const itemStyles = style({
  color: 'heading',
  borderTopWidth: {
    default: 1,
    isQuiet: 0
  },
  borderBottomWidth: {
    default: 0,
    ':last-child': {
      default: 1,
      isQuiet: 0
    }
  },
  borderStartWidth: 0,
  borderEndWidth: 0,
  borderStyle: 'solid',
  borderColor: 'gray-200',
  minWidth: sizeValue(200)
}, getAllowedOverrides());

function Disclosure(props: DisclosureProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, DisclosureContext);
  let domRef = useDOMRef(ref);
  let {
    UNSAFE_style,
    UNSAFE_className = '',
    ...otherProps
  } = props;
  const domProps = filterDOMProps(otherProps);
  let groupProps = useContext(InternalAccordionContext);
  let size = props.size || groupProps.size || 'M';
  let density = groupProps.density || props.density || 'regular';
  let isQuiet = groupProps.isQuiet || props.isQuiet;
  let isDisabled = groupProps.isDisabled || props.isDisabled;

  return (
    <Provider
      values={[
        [InternalDisclosureContext, {size, isQuiet, density, isDisabled}]
      ]}>
      <RACDisclosure
        {...domProps}
        isDisabled={isDisabled}
        ref={domRef}
        style={UNSAFE_style}
        className={(UNSAFE_className ?? '') + itemStyles({isQuiet}, props.styles)}>
        {props.children}
      </RACDisclosure>
    </Provider>
  );
}

/**
 * A disclosure is a collapsible section of content. It is composed of a a header with a heading and trigger button, and a panel that contains the content.
 */
let _Disclosure = /*#__PURE__*/ (forwardRef as forwardRefType)(Disclosure);
export {_Disclosure as Disclosure};

export interface DisclosureHeaderProps extends UnsafeStyles, DOMProps {
  /** The heading level of the disclosure header.
   * 
   * @default 3
   */
  level?: number,
  children: React.ReactNode
}

const headingStyle = style({
  margin: 0
});

const buttonStyles = style({
  ...focusRing(),
  outlineOffset: -2,
  font: 'heading',
  color: {
    default: 'neutral',
    isDisabled: 'disabled'
  },
  fontWeight: 'bold',
  fontSize: {
    size: {
      S: 'heading-xs',
      M: 'heading-sm',
      L: 'heading',
      XL: 'heading-lg'
    }
  },
  lineHeight: 'ui',
  display: 'flex',
  alignItems: 'center',
  paddingX: '[calc(self(minHeight) * 3/8 - 1px)]',
  paddingY: {
    size: {
      S: {
        density: {
          compact: sizeValue(2),
          regular: sizeValue(7),
          spacious: sizeValue(11)
        }
      },
      M: {
        density: {
          compact: sizeValue(5),
          regular: sizeValue(9),
          spacious: sizeValue(13)
        }
      },
      L: {
        density: {
          compact: sizeValue(8),
          regular: sizeValue(11),
          spacious: sizeValue(16)
        }
      },
      XL: {
        density: {
          compact: sizeValue(8),
          regular: sizeValue(12),
          spacious: sizeValue(16)
        }
      }
    }
  },
  gap: '[calc(self(minHeight) * 3/8 - 1px)]',
  height: 'full',
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
    isFocusVisible: fontRelative(6),
    isQuiet: {
      isHovered: fontRelative(6),
      isFocusVisible: fontRelative(6)
    }
  },
  textAlign: 'start',
  disableTapHighlight: true
});

const chevronStyles = style({
  rotate: {
    isRTL: 180,
    isExpanded: 90
  },
  transitionDuration: '100ms',
  transitionProperty: 'rotate',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  },
  flexShrink: 0
});

function DisclosureHeader(props: DisclosureHeaderProps, ref: DOMRef<HTMLDivElement>) {
  let {
    level = 3,
    UNSAFE_style,
    UNSAFE_className = '',
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  const domProps = filterDOMProps(otherProps);
  let {direction} = useLocale();
  let {isExpanded} = useContext(DisclosureStateContext)!;
  let {size, density, isQuiet} = useContext(InternalDisclosureContext);
  let isRTL = direction === 'rtl';
  return (
    <Heading
      {...domProps}
      level={level}
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
 * A header for a disclosure. Contains a heading and a trigger button to expand/collapse the panel.
 */
let _DisclosureHeader = /*#__PURE__*/ (forwardRef as forwardRefType)(DisclosureHeader);
export {_DisclosureHeader as DisclosureHeader};

export interface DisclosurePanelProps extends RACDisclosurePanelProps, UnsafeStyles, DOMProps, AriaLabelingProps {
  children: React.ReactNode
}

const panelStyles = style({
  font: 'body',
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

function DisclosurePanel(props: DisclosurePanelProps, ref: DOMRef<HTMLDivElement>) {
  let {
    UNSAFE_style,
    UNSAFE_className = '',
    ...otherProps
  } = props;
  const domProps = filterDOMProps(otherProps);
  let {size} = useContext(InternalDisclosureContext);
  let {isExpanded} = useContext(DisclosureStateContext)!;
  let panelRef = useDOMRef(ref);
  return (
    <RACDisclosurePanel
      {...domProps}
      ref={panelRef}
      style={UNSAFE_style}
      className={(UNSAFE_className ?? '') + panelStyles({size, isExpanded})}>
      {props.children}
    </RACDisclosurePanel>
  );
}

/**
 * A disclosure panel is a collapsible section of content that is hidden until the disclosure is expanded.
 */
let _DisclosurePanel = /*#__PURE__*/ (forwardRef as forwardRefType)(DisclosurePanel);
export {_DisclosurePanel as DisclosurePanel};

