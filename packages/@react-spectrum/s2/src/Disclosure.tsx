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

import {ActionButtonContext} from './ActionButton';
import {AriaLabelingProps, DOMProps, DOMRef, DOMRefValue, forwardRefType, GlobalDOMAttributes} from '@react-types/shared';
import {baseColor, focusRing, lightDark, space, style} from '../style' with { type: 'macro' };
import {Button, ContextValue, DisclosureStateContext, Heading, Provider, Disclosure as RACDisclosure, DisclosurePanel as RACDisclosurePanel, DisclosurePanelProps as RACDisclosurePanelProps, DisclosureProps as RACDisclosureProps, useLocale, useSlottedContext} from 'react-aria-components';
import {CenterBaseline} from './CenterBaseline';
import {centerPadding, getAllowedOverrides, StyleProps, UnsafeStyles} from './style-utils' with { type: 'macro' };
import Chevron from '../ui-icons/Chevron';
import {filterDOMProps} from '@react-aria/utils';
import React, {createContext, forwardRef, ReactNode, useContext} from 'react';
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface DisclosureProps extends Omit<RACDisclosureProps, 'className' | 'style' | 'children' | keyof GlobalDOMAttributes>, StyleProps {
  /**
   * The size of the disclosure.
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * The amount of space between the disclosures.
   * @default 'regular'
   */
  density?: 'compact' | 'regular' | 'spacious',
  /** Whether the disclosure should be displayed with a quiet style. */
  isQuiet?: boolean,
  /** The contents of the disclosure, consisting of a DisclosureTitle and DisclosurePanel. */
  children: ReactNode
}

export const DisclosureContext = createContext<ContextValue<Partial<DisclosureProps>, DOMRefValue<HTMLDivElement>>>(null);

const disclosure = style({
  color: 'heading',
  borderTopWidth: {
    default: 1,
    isQuiet: 0
  },
  borderBottomWidth: {
    default: 1,
    isQuiet: 0,
    isInGroup: {
      default: 0,
      ':last-child': {
        default: 1,
        isQuiet: 0
      }
    }
  },
  borderStartWidth: 0,
  borderEndWidth: 0,
  borderStyle: 'solid',
  borderColor: 'gray-200',
  minWidth: 200
}, getAllowedOverrides());

/**
 * A disclosure is a collapsible section of content. It is composed of a a header with a heading and trigger button, and a panel that contains the content.
 */
export const Disclosure = forwardRef(function Disclosure(props: DisclosureProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, DisclosureContext);
  let {
    size = 'M',
    density = 'regular',
    isQuiet,
    UNSAFE_style,
    UNSAFE_className = ''
  } = props;
  let domRef = useDOMRef(ref);

  let isInGroup = useContext(DisclosureContext) !== null;

  return (
    <Provider
      values={[
        [DisclosureContext, {size, isQuiet, density}]
      ]}>
      <RACDisclosure
        {...props}
        ref={domRef}
        style={UNSAFE_style}
        className={(UNSAFE_className ?? '') + disclosure({isQuiet, isInGroup}, props.styles)}>
        {props.children}
      </RACDisclosure>
    </Provider>
  );
});

export interface DisclosureTitleProps extends UnsafeStyles, DOMProps {
  /** The heading level of the disclosure header.
   * 
   * @default 3
   */
  level?: number,
  /** The contents of the disclosure header. */
  children: React.ReactNode
}

interface DisclosureHeaderProps extends UnsafeStyles, DOMProps {
  children: React.ReactNode
}

const headingStyle = style({
  margin: 0,
  flexGrow: 1,
  display: 'flex',
  flexShrink: 1,
  minWidth: 0
});

const buttonStyles = style({
  ...focusRing(),
  outlineOffset: -2,
  font: 'heading',
  color: {
    default: baseColor('neutral'),
    isDisabled: 'disabled'
  },
  fontWeight: 'bold',
  fontSize: {
    size: {
      S: 'title-sm',
      M: 'title',
      L: 'title-lg',
      XL: 'title-xl'
    }
  },
  lineHeight: 'ui',
  display: 'flex',
  flexGrow: 1,
  alignItems: 'baseline',
  paddingX: 'calc(self(minHeight) * 3/8 - 1px)',
  paddingY: centerPadding(),
  gap: 'calc(self(minHeight) * 3/8 - 1px)',
  minHeight: {
    // compact is equivalent to 'control', but other densities have more padding.
    size: {
      S: {
        density: {
          compact: 18,
          regular: 24,
          spacious: 32
        }
      },
      M: {
        density: {
          compact: 24,
          regular: 32,
          spacious: 40
        }
      },
      L: {
        density: {
          compact: 32,
          regular: 40,
          spacious: 48
        }
      },
      XL: {
        density: {
          compact: 40,
          regular: 48,
          spacious: 56
        }
      }
    }
  },
  width: 'full',
  backgroundColor: {
    default: 'transparent',
    isFocusVisible: lightDark('transparent-black-100', 'transparent-white-100'),
    isHovered: lightDark('transparent-black-100', 'transparent-white-100'),
    isPressed: lightDark('transparent-black-300', 'transparent-white-300')
  },
  transition: 'default',
  borderWidth: 0,
  borderRadius: {
    // Only rounded for keyboard focus and quiet.
    default: 'none',
    isFocusVisible: 'default',
    isQuiet: 'default'
  },
  textAlign: 'start',
  disableTapHighlight: true
});

const chevronStyles = style({
  rotate: {
    isRTL: 180,
    isExpanded: 90
  },
  transition: 'default',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  },
  flexShrink: 0
});

const InternalDisclosureHeader = createContext<{} | null>(null);

function DisclosureHeaderWithForwardRef(props: DisclosureHeaderProps, ref: DOMRef<HTMLDivElement>) {
  let {
    UNSAFE_className,
    UNSAFE_style,
    children
  } = props;
  let domRef = useDOMRef(ref);
  let {size, isQuiet, density} = useSlottedContext(DisclosureContext)!;

  // Shift button size down by 2 for compact density, 1 for regular/spacious to ensure there is space between the top and bottom of the action button and container
  let newSize : 'XS' | 'S' | 'M' | 'L' | 'XL' | undefined = size;
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const currentIndex = sizes.indexOf(size ?? 'M');
  const shift = density === 'compact' ? 2 : 1;
  newSize = sizes[Math.max(0, currentIndex - shift)] as 'XS' | 'S' | 'M' | 'L' | 'XL';

  return (
    <Provider
      values={[
        [ActionButtonContext, {size: newSize, isQuiet}],
        [InternalDisclosureHeader, {}]
      ]}>
      <div
        style={UNSAFE_style}
        className={(UNSAFE_className ?? '') + style({display: 'flex', alignItems: 'center', gap: 4})}
        ref={domRef}>
        {children}
      </div>
    </Provider>
  );
}

/**
 * A wrapper element for the disclosure title that can contain other elements not part of the trigger.
 */
export const DisclosureHeader = /*#__PURE__*/ (forwardRef as forwardRefType)(DisclosureHeaderWithForwardRef);

/**
 * A disclosure title consisting of a heading and a trigger button to expand/collapse the panel.
 */
export const DisclosureTitle = forwardRef(function DisclosureTitle(props: DisclosureTitleProps, ref: DOMRef<HTMLDivElement>) {
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
  let {size, density, isQuiet} = useSlottedContext(DisclosureContext)!;
  let isRTL = direction === 'rtl';

  let buttonTrigger = (
    <Heading
      {...domProps}
      level={level}
      ref={domRef}
      style={UNSAFE_style}
      className={(UNSAFE_className ?? '') + headingStyle}>
      <Button className={(renderProps) => buttonStyles({...renderProps, size, density, isQuiet})} slot="trigger">
        <CenterBaseline>
          <Chevron size={size} className={chevronStyles({isExpanded, isRTL})} aria-hidden="true" />
        </CenterBaseline>
        {props.children}
      </Button>
    </Heading>
  );
  let ctx = useContext(InternalDisclosureHeader);
  if (ctx) {
    return buttonTrigger;
  }

  return (
    <DisclosureHeader>
      {buttonTrigger}
    </DisclosureHeader>
  );
});

export interface DisclosurePanelProps extends Omit<RACDisclosurePanelProps, 'className' | 'style' | 'children'>, UnsafeStyles, DOMProps, AriaLabelingProps {
  children: React.ReactNode
}

const panelStyles = style({
  font: 'body',
  height: '--disclosure-panel-height',
  overflow: 'clip',
  transition: {
    default: '[height]',
    '@media (prefers-reduced-motion: reduce)': 'none'
  }
});

const panelInner = style({
  paddingTop: 8,
  paddingBottom: 16,
  paddingX: {
    size: {
      S: 8,
      M: space(9),
      L: 12,
      XL: space(15)
    }
  }
});

/**
 * A disclosure panel is a collapsible section of content that is hidden until the disclosure is expanded.
 */
export const DisclosurePanel = forwardRef(function DisclosurePanel(props: DisclosurePanelProps, ref: DOMRef<HTMLDivElement>) {
  let {
    UNSAFE_style,
    UNSAFE_className = '',
    ...otherProps
  } = props;
  const domProps = filterDOMProps(otherProps);
  let {size} = useSlottedContext(DisclosureContext)!;
  let panelRef = useDOMRef(ref);
  return (
    <RACDisclosurePanel
      {...domProps}
      ref={panelRef}
      style={UNSAFE_style}
      className={(UNSAFE_className ?? '') + panelStyles}>
      <div className={panelInner({size})}>
        {props.children}
      </div>
    </RACDisclosurePanel>
  );
});

