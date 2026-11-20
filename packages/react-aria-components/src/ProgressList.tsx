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
import {useId} from 'react-aria/useId';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';

export interface ProgressListProps<T>
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
   * @default 'react-aria-ProgressList'
   */
  className?: string;
  /**
   * The `id` of the currently selected `ProgressListItem`. Steps before it in the collection are
   * marked as completed, and steps after it are marked as not completed.
   */
  selectedKey: Key;
}

export const ProgressListContext =
  createContext<ContextValue<ProgressListProps<any>, HTMLOListElement>>(null);

interface ProgressListState {
  /** The key of the currently selected step. */
  selectedKey: Key;
  /** The index of the currently selected step within the collection, or -1 if it isn't present. */
  selectedIndex: number;
}

const InternalProgressListContext = createContext<ProgressListState | null>(null);

/**
 * A ProgressList displays the steps of a multi-step process, and which of them the user has
 * completed.
 */
export const ProgressList = /*#__PURE__*/ (forwardRef as forwardRefType)(function ProgressList<T>(
  props: ProgressListProps<T>,
  ref: ForwardedRef<HTMLOListElement>
) {
  [props, ref] = useContextProps(props, ref, ProgressListContext);
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
          className={props.className ?? 'react-aria-ProgressList'}>
          <InternalProgressListContext.Provider
            value={{selectedKey, selectedIndex: collection.getItem(selectedKey)?.index ?? -1}}>
            <CollectionRoot collection={collection} />
          </InternalProgressListContext.Provider>
        </dom.ol>
      )}
    </CollectionBuilder>
  );
});

export interface ProgressListItemRenderProps {
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
  /** The position of the step within the `ProgressList`, starting from 1. */
  stepNumber: number;
}

export interface ProgressListItemProps
  extends
    RenderProps<ProgressListItemRenderProps, 'li'>,
    GlobalDOMAttributes<HTMLLIElement>,
    AriaLabelingProps {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-ProgressListItem'
   */
  className?: ClassNameOrFunction<ProgressListItemRenderProps>;
  /** A unique id for the step, which is compared against the `selectedKey` of the `ProgressList`. */
  id?: Key;
}

class ProgressListItemNode extends CollectionNode<unknown> {
  static readonly type = 'item';
}

/**
 * A ProgressListItem represents an individual step within a `<ProgressList>`.
 */
export const ProgressListItem = /*#__PURE__*/ createLeafComponent(
  ProgressListItemNode,
  function ProgressListItem(
    props: ProgressListItemProps,
    ref: ForwardedRef<HTMLLIElement>,
    node: Node<unknown>
  ) {
    let state = useContext(InternalProgressListContext);
    let stringFormatter = useLocalizedStringFormatter(intlMessages, 'react-aria-components');
    let hiddenId = useId();

    let isCurrent = state != null && node.key === state.selectedKey;
    // A step is completed if it comes before the current step in the collection.
    let isCompleted = state != null && state.selectedIndex >= 0 && node.index < state.selectedIndex;

    let renderProps = useRenderProps({
      ...node.props,
      children: node.rendered,
      values: {isCurrent, isCompleted, stepNumber: node.index + 1},
      defaultClassName: 'react-aria-ProgressListItem'
    });

    let DOMProps = filterDOMProps(props as any, {global: true, labelable: true});
    // `id` identifies the step rather than the DOM element, so it is not forwarded to the DOM.
    delete DOMProps.id;

    let message = stringFormatter.format('progressListItemNotCompleted');
    if (isCurrent) {
      message = stringFormatter.format('progressListItemCurrent');
    } else if (isCompleted) {
      message = stringFormatter.format('progressListItemCompleted');
    }

    return (
      <ProgressListItemContext.Provider value={{hiddenId}}>
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
      </ProgressListItemContext.Provider>
    );
  }
);

export interface ProgressListItemContentProps
  extends
    DOMProps,
    AriaLabelingProps,
    DOMRenderProps<'div', undefined>,
    GlobalDOMAttributes<HTMLDivElement> {}

const ProgressListItemContext = createContext<{hiddenId: string | undefined} | undefined>(
  undefined
);

/**
 * A ProgressListItemContent renders the content of a `<ProgressListItem>`.
 */
export const ProgressListItemContent = /*#__PURE__*/ (forwardRef as forwardRefType)(
  function ProgressListItemContent(
    props: ProgressListItemContentProps,
    ref: ForwardedRef<HTMLDivElement>
  ) {
    let context = useContext(ProgressListItemContext);
    let id = useId();
    let DOMProps = filterDOMProps(props, {global: true, labelable: true});
    delete DOMProps.id;

    let ariaLabeledBy = props['aria-labelledby']
      ? `${context?.hiddenId} ${props['aria-labelledby']}`
      : `${context?.hiddenId} ${id}`;

    return (
      <dom.div
        {...mergeProps(DOMProps, {role: 'img'})}
        ref={ref}
        render={props.render}
        id={id}
        style={props.style}
        className={props.className ?? 'react-aria-ProgressListItemContent'}
        aria-labelledby={ariaLabeledBy}>
        {props.children}
      </dom.div>
    );
  }
);
