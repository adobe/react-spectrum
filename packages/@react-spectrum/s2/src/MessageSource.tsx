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

import {AriaLabelingProps, DOMProps, DOMRef, forwardRefType} from '@react-types/shared';
import {
  Disclosure,
  DisclosurePanel,
  DisclosurePanelProps,
  DisclosureProps,
  DisclosureTitle
} from './Disclosure';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {getAllowedOverrides, StyleProps, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {Link, LinkProps} from './Link';
import {NumberFormatter} from '@internationalized/number';
import React, {createContext, forwardRef, useContext} from 'react';
import {useDOMRef} from './useDOMRef';
import {useLocale} from 'react-aria/I18nProvider';
import {style} from '../style' with {type: 'macro'};
import {SlotProps} from 'react-aria-components/slots';

export interface MessageSourceProps extends Omit<DisclosureProps, 'isQuiet'> {
  label: string;
}

/**
 * Message sources display references associated with a system message. Associating the source to
 * the output builds trust and transparency in the conversation.
 */
export const MessageSource = (forwardRef as forwardRefType)(function MessageSource(
  props: MessageSourceProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {label, ...otherProps} = props;

  return (
    <Disclosure {...otherProps} ref={ref} isQuiet>
      {/* we can do this if we don't plan to allow extra stuff like buttons and icons inside the message source. otherwise, might be good to do what we did in S2 Disclosure and have users render their own DisclosureTitle/DisclosureHeader */}
      {/* will note that this matches more closely with how swc has chosen to implement it */}
      <DisclosureTitle>{label}</DisclosureTitle>
      {props.children}
    </Disclosure>
  );
});

// SourceList injects a 1-based index so SourceListItem
// can render it without needing an explicit prop.
const SourceListIndexContext = createContext<number>(0);

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

export interface SourceListItemProps extends LinkProps, UnsafeStyles, DOMProps {
  /** The content of the source list item. */
  children: React.ReactNode;
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
  let {id, children, UNSAFE_style, UNSAFE_className = '', ...otherProps} = props;
  let itemRef = useDOMRef(ref);

  return (
    <li
      key={id}
      ref={itemRef}
      style={UNSAFE_style}
      className={(UNSAFE_className ?? '') + itemStyles}>
      <NumberBadge value={index} />
      {/* maybe link should support t-shirt sizing? or we need to make it custom so that the font size changes  */}
      <Link variant="secondary" {...otherProps}>
        {children}
      </Link>
    </li>
  );
});

export interface NumberBadgeStyleProps {
  /**
   * The size of the notification badge.
   *
   * @default 'S'
   */
  size?: 'S' | 'M' | 'L' | 'XL';
}

export interface NumberBadgeProps
  extends DOMProps, AriaLabelingProps, StyleProps, NumberBadgeStyleProps, SlotProps {
  /**
   * The value to be displayed in the notification badge.
   */
  value: number;
}

// TODO: need to update the styles so that the width of the badge is consistent (so making sure the numbers themselves have the same width if they have the same number of digits)
const badge = style(
  {
    display: 'flex',
    font: 'ui',
    color: 'gray-900',
    fontSize: {
      size: {
        S: 'ui-xs',
        M: 'ui-xs',
        L: 'ui-sm',
        XL: 'ui'
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
    // figure out the tshirt sizing here
    width: 16,
    height: 20,
    borderRadius: 'sm'
  },
  getAllowedOverrides()
);

/**
 * NumberBadge are used to number the order in a list...idk something.
 */
export const NumberBadge = forwardRef(function Badge(
  props: NumberBadgeProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {size = 'S', value, ...otherProps} = props;
  let domRef = useDOMRef(ref);
  let {locale} = useLocale();
  let formattedValue = '';

  if (value <= 0) {
    throw new Error('Value cannot be negative or zero');
  } else if (!Number.isInteger(value)) {
    throw new Error('Value must be a positive integer');
  } else {
    formattedValue = new NumberFormatter(locale).format(value);
  }

  let ariaLabel = props['aria-label'] || undefined;

  return (
    <span
      {...filterDOMProps(otherProps, {labelable: true})}
      role={ariaLabel && 'img'}
      aria-label={ariaLabel}
      className={
        (props.UNSAFE_className || '') +
        badge(
          {
            size
          },
          props.styles
        )
      }
      style={props.UNSAFE_style}
      ref={domRef}>
      {formattedValue}
    </span>
  );
});
