/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  AriaLabelingProps,
  DOMProps,
  DOMRef,
  forwardRefType,
  GlobalDOMAttributes
} from '@react-types/shared';
import {baseColor, focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {
  Disclosure,
  DisclosurePanel,
  DisclosurePanelProps,
  DisclosureProps,
  DisclosureTitle
} from '@react-spectrum/s2/Disclosure';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {Link, LinkProps} from 'react-aria-components/Link';
import {mergeStyles} from '@react-spectrum/s2/mergeStyles';
import {NumberFormatter} from '@internationalized/number';
import React, {createContext, forwardRef, useContext} from 'react';
import {SlotProps} from 'react-aria-components/slots';
import {StyleString} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useDOMRef} from './useDOMRef';
import {useLocale} from 'react-aria/I18nProvider';

export interface MessageSourceProps extends Omit<
  DisclosureProps,
  'isQuiet' | 'UNSAFE_className' | 'UNSAFE_style'
> {
  label: string;
}

const MessageSourceInternalContext = createContext<{size: 'S' | 'M' | 'L' | 'XL'}>({size: 'M'});

/**
 * Message sources display references associated with a system message. Associating the source to
 * the output builds trust and transparency in the conversation.
 */
export const MessageSource = (forwardRef as forwardRefType)(function MessageSource(
  props: MessageSourceProps,
  ref: DOMRef<HTMLDivElement>
) {
  // [props, ref] = useSpectrumContextProps(props, ref, MessageSourceContext);
  let {label, children, size = 'M', styles, ...otherProps} = props;

  return (
    <MessageSourceInternalContext.Provider value={{size}}>
      <NumberBadgeContext.Provider value={{size}}>
        <Disclosure {...otherProps} styles={styles} size={size} ref={ref} isQuiet>
          <DisclosureTitle>{label}</DisclosureTitle>
          {children}
        </Disclosure>
      </NumberBadgeContext.Provider>
    </MessageSourceInternalContext.Provider>
  );
});

// SourceList injects a 1-based index so SourceListItem
// can render it without needing an explicit prop.
const SourceListIndexContext = createContext<number>(1);

const listStyles = style({
  listStyleType: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 4
});

const itemStyles = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8
});

export interface SourceListProps extends DisclosurePanelProps {}

/**
 * A SourceList displays an ordered list of sources inside a MessageSource.
 * Wrap SourceListItem children inside to have them numbered automatically.
 */
export const SourceList = (forwardRef as forwardRefType)(function SourceList(
  props: SourceListProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {children, ...otherProps} = props;

  let numberedChildren = React.Children.map(children, (child, i) => (
    <SourceListIndexContext.Provider value={i + 1}>{child}</SourceListIndexContext.Provider>
  ));

  return (
    <DisclosurePanel {...otherProps} ref={ref}>
      <ol className={listStyles}>{numberedChildren}</ol>
    </DisclosurePanel>
  );
});

const linkStyles = style({
  ...focusRing(),
  font: {
    size: {
      S: 'body-sm',
      M: 'body',
      L: 'body-lg',
      XL: 'body-xl'
    }
  },
  borderRadius: 'sm',
  color: baseColor('neutral'),
  disableTapHighlight: true
});

export interface SourceListItemProps
  extends Omit<LinkProps, 'className' | 'style' | 'render' | keyof GlobalDOMAttributes>, DOMProps {
  /** The content of the source list item. */
  children: React.ReactNode;
  /**
   * Spectrum-defined styles, returned by the `style()` macro.
   */
  styles?: StyleString;
}

/**
 * A SourceListItem represents a single source within a SourceList.
 * The item number is provided automatically by the parent SourceList.
 */
export const SourceListItem = (forwardRef as forwardRefType)(function SourceListItem(
  props: SourceListItemProps,
  ref: DOMRef<HTMLLIElement>
) {
  let index = useContext(SourceListIndexContext);
  let {size} = useContext(MessageSourceInternalContext);
  let {children, ...otherProps} = props;
  let itemRef = useDOMRef(ref);

  return (
    <li ref={itemRef} className={mergeStyles(itemStyles, props.styles)}>
      <NumberBadge value={index} size={size} />
      <Link {...otherProps} className={renderProps => linkStyles({size, ...renderProps})}>
        {children}
      </Link>
    </li>
  );
});

interface NumberBadgeStyleProps {
  /**
   * The size of the number badge.
   *
   * @default 'S'
   */
  size?: 'S' | 'M' | 'L' | 'XL';
}

export interface NumberBadgeProps
  extends DOMProps, AriaLabelingProps, NumberBadgeStyleProps, SlotProps {
  /**
   * The value to be displayed in the notification badge.
   */
  value: number;
  /**
   * Spectrum-defined styles, returned by the `style()` macro.
   */
  styles?: StyleString;
}

const NumberBadgeContext = createContext<{size?: 'S' | 'M' | 'L' | 'XL'}>({});

const badge = style({
  display: 'flex',
  color: 'gray-900',
  font: {
    size: {
      S: 'ui-xs',
      M: 'ui-sm',
      L: 'ui',
      XL: 'ui-lg'
    }
  },
  borderStyle: {
    forcedColors: 'solid'
  },
  borderWidth: {
    forcedColors: '[1px]'
  },
  borderColor: {
    forcedColors: 'ButtonBorder'
  },
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'gray-200',
  // These are arbitrary sizes since there are no designs for them
  width: {
    size: {
      S: 14,
      M: 16,
      L: 18,
      XL: 20
    }
  },
  height: {
    size: {
      S: 18,
      M: 20,
      L: 22,
      XL: 24
    }
  },
  borderRadius: 'sm'
});

/**
 * A small visual indicator showing a count or position.
 */
export const NumberBadge = forwardRef(function NumberBadge(
  props: NumberBadgeProps,
  ref: DOMRef<HTMLSpanElement>
) {
  let {size = 'M', value, ...otherProps} = props;
  let domRef = useDOMRef(ref);
  let {locale} = useLocale();
  let formattedValue = '';

  if (value <= 0 && process.env.NODE_ENV !== 'production') {
    console.warn('Value must be a positive integer');
  } else {
    formattedValue = new NumberFormatter(locale).format(value);
  }

  // let ariaLabel = props['aria-label'] || undefined;
  return (
    <span
      {...filterDOMProps(otherProps)}
      // role={ariaLabel && 'img'}
      // aria-label={ariaLabel}
      // We set aria-hidden to true to prevent screenreader from announcing the value of the badge by itself which is not very meaningful.
      aria-hidden="true"
      className={mergeStyles(
        badge({
          size
        }),
        props.styles
      )}
      ref={domRef}>
      {formattedValue}
    </span>
  );
});
