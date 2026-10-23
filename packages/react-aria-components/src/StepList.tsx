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
  forwardRefType,
  GlobalDOMAttributes,
  Key,
  LinkDOMProps,
  Node
} from '@react-types/shared';
import {
  ClassNameOrFunction,
  ContextValue,
  dom,
  DOMProps,
  DOMRenderProps,
  RenderProps,
  SlotProps,
  StyleProps,
  useContextProps,
  useRenderProps
} from './utils';
import {Collection} from 'react-aria/Collection';
import {CollectionBuilder, createLeafComponent} from 'react-aria/CollectionBuilder';
import {CollectionNode} from 'react-aria/private/collections/BaseCollection';
import {CollectionProps, CollectionRendererContext} from './Collection';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import intlMessages from '../intl/*.json';
import {mergeProps} from 'react-aria/mergeProps';
import React, {createContext, ForwardedRef, forwardRef, useContext} from 'react';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useId} from 'react-aria/useId';
import {useLink} from 'react-aria/useLink';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useObjectRef} from 'react-aria/useObjectRef';

export interface StepListProps<T>
  extends
    Omit<CollectionProps<T>, 'disabledKeys'>,
    StyleProps,
    SlotProps,
    AriaLabelingProps,
    DOMRenderProps<'ol', undefined>,
    GlobalDOMAttributes<HTMLOListElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element.
   *
   * @default 'react-aria-StepList'
   */
  className?: string;
  /**
   * The `id` of the currently selected `StepListItem`. Steps before it in the collection are marked
   * as completed, and steps after it are marked as not completed.
   */
  selectedKey: Key;
}

export const StepListContext =
  createContext<ContextValue<StepListProps<any>, HTMLOListElement>>(null);

interface StepListState {
  /** The key of the currently selected step. */
  selectedKey: Key;
  /** The index of the currently selected step within the collection, or -1 if it isn't present. */
  selectedIndex: number;
}

const InternalStepListContext = createContext<StepListState | null>(null);

/**
 * A StepList displays the steps of a multi step process, and which of them the user has completed.
 */
export const StepList = /*#__PURE__*/ (forwardRef as forwardRefType)(function StepList<T>(
  props: StepListProps<T>,
  ref: ForwardedRef<HTMLOListElement>
) {
  [props, ref] = useContextProps(props, ref, StepListContext);
  let {CollectionRoot} = useContext(CollectionRendererContext);
  let {selectedKey} = props;
  let DOMProps = filterDOMProps(props, {global: true, labelable: true});

  return (
    <CollectionBuilder content={<Collection {...props} />}>
      {collection => (
        <dom.ol
          {...DOMProps}
          render={props.render}
          role="list"
          ref={ref}
          slot={props.slot || undefined}
          style={props.style}
          className={props.className ?? 'react-aria-StepList'}>
          <InternalStepListContext.Provider
            value={{selectedKey, selectedIndex: collection.getItem(selectedKey)?.index ?? -1}}>
            <CollectionRoot collection={collection} />
          </InternalStepListContext.Provider>
        </dom.ol>
      )}
    </CollectionBuilder>
  );
});

export interface StepListItemRenderProps {
  /**
   * Whether the step is the currently selected step.
   *
   * @selector [data-current]
   */
  isCurrent: boolean;
  /**
   * Whether the step is rendered before the currently selected step.
   *
   * @selector [data-completed]
   */
  isCompleted: boolean;
  /** The position of the step within the `StepList`, starting from 1. */
  stepNumber: number;
}

export interface StepListItemProps
  extends
    RenderProps<StepListItemRenderProps, 'li'>,
    GlobalDOMAttributes<HTMLLIElement>,
    AriaLabelingProps {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-StepListItem'
   */
  className?: ClassNameOrFunction<StepListItemRenderProps>;
  /** A unique id for the step, which is compared against the `selectedKey` of the `StepList`. */
  id?: Key;
}

class StepListItemNode extends CollectionNode<unknown> {
  static readonly type = 'item';
}

/**
 * A StepListItem represents an individual step within a `<StepList>`.
 */
export const StepListItem = /*#__PURE__*/ createLeafComponent(
  StepListItemNode,
  function StepListItem(
    props: StepListItemProps,
    ref: ForwardedRef<HTMLLIElement>,
    node: Node<unknown>
  ) {
    let state = useContext(InternalStepListContext);
    let stringFormatter = useLocalizedStringFormatter(intlMessages, 'react-aria-components');
    let hiddenId = useId();

    let isCurrent = state != null && node.key === state.selectedKey;
    // A step is completed if it comes before the current step in the collection.
    let isCompleted = state != null && state.selectedIndex >= 0 && node.index < state.selectedIndex;

    let renderProps = useRenderProps({
      ...node.props,
      children: node.rendered,
      values: {isCurrent, isCompleted, stepNumber: node.index + 1},
      defaultClassName: 'react-aria-StepListItem'
    });

    let DOMProps = filterDOMProps(props as any, {global: true, labelable: true});
    // `id` identifies the step rather than the DOM element, so it is not forwarded to the DOM.
    delete DOMProps.id;

    let message = stringFormatter.format('stepListItemNotCompleted');
    if (isCurrent) {
      message = stringFormatter.format('stepListItemCurrent');
    } else if (isCompleted) {
      message = stringFormatter.format('stepListItemCompleted');
    }

    return (
      <StepListItemContext.Provider value={{hiddenId}}>
        <dom.li
          {...mergeProps(DOMProps, renderProps)}
          role="listitem"
          ref={ref}
          aria-current={isCurrent ? 'step' : undefined}
          data-current={isCurrent || undefined}
          data-completed={isCompleted || undefined}>
          <span hidden id={hiddenId}>
            {message}
          </span>
          {renderProps.children}
        </dom.li>
      </StepListItemContext.Provider>
    );
  }
);

export interface StepListItemContentProps
  extends
    DOMProps,
    LinkDOMProps,
    AriaLabelingProps,
    Omit<GlobalDOMAttributes<HTMLElement>, 'onClick'> {}

const StepListItemContext = createContext<{hiddenId: string | undefined} | undefined>(undefined);

// Need this so I can get an id on the contents so that the announcement makes sense.
// It lands on this element, not the `li` itself.
export const StepListItemContent = /*#__PURE__*/ (forwardRef as forwardRefType)(
  function StepListItemContent(
    props: StepListItemContentProps,
    ref: ForwardedRef<HTMLAnchorElement | HTMLDivElement>
  ) {
    let context = useContext(StepListItemContext);
    let objRef = useObjectRef(ref);
    let id = useId();
    // A step is only navigable when it is given an `href`. Otherwise `role="img"` is applied to a
    // non-focusable element purely so that screen readers treat the contents as a single unit.
    let isLink = props.href != null;
    let elementType = isLink ? 'a' : 'div';
    let {linkProps} = useLink({...props, elementType}, objRef);
    let ElementType = dom[elementType];
    // Only a link is interactive, so a plain `div` never reports hover or focus.
    let {hoverProps, isHovered} = useHover({isDisabled: !isLink});
    let {focusProps, isFocusVisible} = useFocusRing();
    let DOMProps = filterDOMProps(props, {global: true, labelable: true, isLink});
    delete DOMProps.id;

    return (
      <ElementType
        {...mergeProps(
          DOMProps,
          isLink ? mergeProps(linkProps, focusProps) : {role: 'img'},
          hoverProps
        )}
        ref={objRef}
        id={id}
        className="react-aria-StepListItemContent"
        aria-labelledby={`${context?.hiddenId} ${id}`}
        data-hovered={isHovered || undefined}
        data-focus-visible={isFocusVisible || undefined}>
        {props.children}
      </ElementType>
    );
  }
);
