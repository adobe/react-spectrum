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

import {AriaLabelingProps, DOMProps, DOMRef, DOMRefValue, Key} from '@react-types/shared';
import {ContextValue, DisclosureGroup, RenderProps, SlotProps} from 'react-aria-components';
import {
  Disclosure,
  DisclosureContext,
  DisclosureHeader,
  DisclosurePanel,
  DisclosureTitle
} from './Disclosure';
import {getAllowedOverrides, StyleProps, StylesPropWithHeight, UnsafeStyles} from './style-utils' with { type: 'macro' };
import React, {createContext, forwardRef, ReactNode} from 'react';
import {style} from '../style' with { type: 'macro' };
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface AccordionProps extends UnsafeStyles, DOMProps, SlotProps {
  /** The accordion item elements in the accordion. */
  children: React.ReactNode,
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight,
  /**
   * The size of the accordion.
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * The amount of space between the accordion items.
   * @default 'regular'
   */
  density?: 'compact' | 'regular' | 'spacious',
  /** Whether the accordion should be displayed with a quiet style. */
  isQuiet?: boolean,
  /** Whether multiple accordion items can be expanded at the same time. */
  allowsMultipleExpanded?: boolean,
  /** Whether all accordion items are disabled. */
  isDisabled?: boolean,
  /** The currently expanded keys in the accordion (controlled). */
  expandedKeys?: Iterable<Key>,
  /** The initial expanded keys in the accordion (uncontrolled). */
  defaultExpandedKeys?: Iterable<Key>,
  /** Handler that is called when accordion items are expanded or collapsed. */
  onExpandedChange?: (keys: Set<Key>) => any
}

const accordion = style({
  display: 'flex',
  flexDirection: 'column'
}, getAllowedOverrides({height: true}));

export const AccordionContext = createContext<ContextValue<Partial<AccordionProps>, DOMRefValue<HTMLDivElement>>>(null);

/**
 * An accordion is a container for multiple accordion items.
 */
export const Accordion = forwardRef(function Accordion(props: AccordionProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, AccordionContext);
  let domRef = useDOMRef(ref);
  let {
    UNSAFE_style,
    UNSAFE_className = '',
    size = 'M',
    density = 'regular',
    isQuiet
  } = props;
  return (
    <DisclosureContext.Provider value={{size, isQuiet, density}}>
      <DisclosureGroup
        {...props}
        ref={domRef}
        style={UNSAFE_style}
        className={(UNSAFE_className ?? '') + accordion(null, props.styles)}>
        {props.children}
      </DisclosureGroup>
    </DisclosureContext.Provider>
  );
});

export interface AccordionItemState {
  /** Whether the accordion item is currently expanded. */
  readonly isExpanded: boolean,
  /** Sets whether the accordion item is expanded. */
  setExpanded(isExpanded: boolean): void,
  /** Expand the accordion item. */
  expand(): void,
  /** Collapse the accordion item. */
  collapse(): void,
  /** Toggles the accordion item's visibility. */
  toggle(): void
}

export interface AccordionItemRenderProps {
  /**
   * Whether the accordion item is expanded.
   * @selector [data-expanded]
   */
  isExpanded: boolean,
  /**
   * Whether the accordion item has keyboard focus.
   * @selector [data-focus-visible-within]
   */
  isFocusVisibleWithin: boolean,
  /**
   * Whether the accordion item is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * State of the accordion item.
   */
  state: AccordionItemState
}

export interface AccordionItemProps extends Omit<RenderProps<AccordionItemRenderProps>, 'className' | 'style'>, SlotProps, StyleProps {
  /**
   * The size of the accordion item.
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * The amount of space between the accordion item.
   * @default 'regular'
   */
  density?: 'compact' | 'regular' | 'spacious',
  /** Whether the accordion item should be displayed with a quiet style. */
  isQuiet?: boolean,
  /** The contents of the accordion item, consisting of a accordion item title and accordion item panel. */
  children: ReactNode,
  /** An id for the accordion item, matching the id used in `expandedKeys`. */
  id?: Key,
  /** Whether the accordion item is disabled. */
  isDisabled?: boolean,
  /** Handler that is called when the accordion item's expanded state changes. */
  onExpandedChange?: (isExpanded: boolean) => void,
  /** Whether the accordion item is expanded (controlled). */
  isExpanded?: boolean,
  /** Whether the accordion item is expanded by default (uncontrolled). */
  defaultExpanded?: boolean
}

/**
 * A accordion item is a collapsible section of content. It is composed of a header with a heading and trigger button, and a panel that contains the content.
 */
export const AccordionItem = forwardRef(function AccordionItem(props: AccordionItemProps, ref: DOMRef<HTMLDivElement>) {
  return <Disclosure {...props} ref={ref} />;
});

export interface AccordionItemTitleProps extends UnsafeStyles, DOMProps {
  /** The heading level of the accordion item title.
   *
   * @default 3
   */
  level?: number,
  /** The contents of the accordion item title. */
  children: React.ReactNode
}

/**
 * An accordion item title consisting of a heading and a trigger button to expand/collapse the panel.
 */
export const AccordionItemTitle = forwardRef(function AccordionItemTitle(props: AccordionItemTitleProps, ref: DOMRef<HTMLDivElement>) {
  return <DisclosureTitle {...props} ref={ref} />;
});

export interface AccordionItemHeaderProps extends UnsafeStyles, DOMProps {
  /** The contents of the accordion item header. */
  children: React.ReactNode
}

/**
 * A wrapper element for the accordion item title that can contain other elements not part of the trigger.
 */
export const AccordionItemHeader = forwardRef(function AccordionItemHeader(props: AccordionItemHeaderProps, ref: DOMRef<HTMLDivElement>) {
  return <DisclosureHeader {...props} ref={ref} />;
});

export interface AccordionItemPanelProps extends UnsafeStyles, DOMProps, AriaLabelingProps {
  /** The contents of the accordion item panel. */
  children: React.ReactNode,
  /**
   * The accessibility role for the accordion item panel.
   * @default 'group'
   */
  role?: 'group' | 'region'
}

/**
 * An accordion item panel is a collapsible section of content that is hidden until the accordion item is expanded.
 */
export const AccordionItemPanel = forwardRef(function AccordionItemPanel(props: AccordionItemPanelProps, ref: DOMRef<HTMLDivElement>) {
  return <DisclosurePanel {...props} ref={ref} />;
});
