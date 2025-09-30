/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaTagGroupProps, useFocusRing, useHover, useTag, useTagGroup} from 'react-aria';
import {ButtonContext} from './Button';
import {Collection, CollectionBuilder, createLeafComponent, ItemNode} from '@react-aria/collections';
import {CollectionProps, CollectionRendererContext, DefaultCollectionRenderer, ItemRenderProps, usePersistedKeys} from './Collection';
import {ContextValue, DOMProps, Provider, RenderProps, SlotProps, StyleRenderProps, useContextProps, useRenderProps, useSlot} from './utils';
import {filterDOMProps, mergeProps, useObjectRef} from '@react-aria/utils';
import {forwardRefType, GlobalDOMAttributes, HoverEvents, Key, LinkDOMProps, PressEvents, RefObject} from '@react-types/shared';
import {LabelContext} from './Label';
import {ListState, Node, UNSTABLE_useFilteredListState, useListState} from 'react-stately';
import {ListStateContext} from './ListBox';
import React, {createContext, ForwardedRef, forwardRef, JSX, ReactNode, useContext, useEffect, useRef} from 'react';
import {SelectableCollectionContext, SelectableCollectionContextValue} from './RSPContexts';
import {SelectionIndicatorContext} from './SelectionIndicator';
import {SharedElementTransition} from './SharedElementTransition';
import {TextContext} from './Text';

export interface TagGroupProps extends Omit<AriaTagGroupProps<unknown>, 'children' | 'items' | 'label' | 'description' | 'errorMessage' | 'keyboardDelegate'>, DOMProps, SlotProps, GlobalDOMAttributes<HTMLDivElement> {}

export interface TagListRenderProps {
  /**
   * Whether the tag list has no items and should display its empty state.
   * @selector [data-empty]
   */
  isEmpty: boolean,
  /**
   * Whether the tag list is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the tag list is currently keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * State of the TagGroup.
   */
  state: ListState<unknown>
}

export interface TagListProps<T> extends Omit<CollectionProps<T>, 'disabledKeys'>, StyleRenderProps<TagListRenderProps>, GlobalDOMAttributes<HTMLDivElement> {
  /** Provides content to display when there are no items in the tag list. */
  renderEmptyState?: (props: TagListRenderProps) => ReactNode
}

export const TagGroupContext = createContext<ContextValue<TagGroupProps, HTMLDivElement>>(null);
export const TagListContext = createContext<ContextValue<TagListProps<any>, HTMLDivElement>>(null);

/**
 * A tag group is a focusable list of labels, categories, keywords, filters, or other items, with support for keyboard navigation, selection, and removal.
 */
export const TagGroup = /*#__PURE__*/ (forwardRef as forwardRefType)(function TagGroup(props: TagGroupProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, TagGroupContext);
  return (
    <ListStateContext.Provider value={null}>
      <CollectionBuilder content={props.children}>
        {collection => <TagGroupInner props={props} forwardedRef={ref} collection={collection} />}
      </CollectionBuilder>
    </ListStateContext.Provider>
  );
});

interface TagGroupInnerProps<T> {
  props: TagGroupProps & SelectableCollectionContextValue<T>,
  forwardedRef: ForwardedRef<HTMLDivElement>,
  collection
}

function TagGroupInner<T extends object>({props, forwardedRef: ref, collection}: TagGroupInnerProps<T>) {
  let tagListRef = useRef<HTMLElement>(null);
  // Extract the user provided id so it doesn't clash with the collection id provided by Autocomplete
  let {id, ...otherProps} = props;
  [otherProps, tagListRef] = useContextProps(otherProps, tagListRef, SelectableCollectionContext);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let {filter, shouldUseVirtualFocus, ...DOMCollectionProps} = otherProps;
  let [labelRef, label] = useSlot(
    !props['aria-label'] && !props['aria-labelledby']
  );
  let tagGroupState = useListState({
    ...DOMCollectionProps,
    children: undefined,
    collection
  });

  let filteredState = UNSTABLE_useFilteredListState(tagGroupState as ListState<T>, filter);

  // Prevent DOM props from going to two places.
  let domProps = filterDOMProps(otherProps, {global: true});
  let domPropOverrides = Object.fromEntries(Object.entries(domProps).map(([k, val]) => [k, k === 'id' ? val : undefined]));
  let {
    gridProps,
    labelProps,
    descriptionProps,
    errorMessageProps
  } = useTagGroup({
    ...DOMCollectionProps,
    ...domPropOverrides,
    label
  }, filteredState, tagListRef);

  return (
    <div
      {...domProps}
      id={id}
      ref={ref}
      slot={props.slot || undefined}
      className={props.className ?? 'react-aria-TagGroup'}
      style={props.style}>
      <Provider
        values={[
          [LabelContext, {...labelProps, elementType: 'span', ref: labelRef}],
          [TagListContext, {...gridProps, ref: tagListRef as RefObject<HTMLDivElement>}],
          [ListStateContext, filteredState],
          [TextContext, {
            slots: {
              description: descriptionProps,
              errorMessage: errorMessageProps
            }
          }]
        ]}>
        {props.children}
      </Provider>
    </div>
  );
}

/**
 * A tag list is a container for tags within a TagGroup.
 */
export const TagList = /*#__PURE__*/ (forwardRef as forwardRefType)(function TagList<T extends object>(props: TagListProps<T>, ref: ForwardedRef<HTMLDivElement>): JSX.Element {
  let state = useContext(ListStateContext);
  return state
    ? <TagListInner props={props} forwardedRef={ref} />
    : <Collection {...props} />;
});

interface TagListInnerProps<T> {
  props: TagListProps<T>,
  forwardedRef: ForwardedRef<HTMLDivElement>
}

function TagListInner<T extends object>({props, forwardedRef}: TagListInnerProps<T>) {
  let state = useContext(ListStateContext)!;
  let {CollectionRoot} = useContext(CollectionRendererContext);
  let [gridProps, ref] = useContextProps({}, forwardedRef, TagListContext);

  let {focusProps, isFocused, isFocusVisible} = useFocusRing();
  let renderValues = {
    isEmpty: state.collection.size === 0,
    isFocused,
    isFocusVisible,
    state
  };
  let renderProps = useRenderProps({
    className: props.className,
    style: props.style,
    defaultClassName: 'react-aria-TagList',
    values: renderValues
  });

  let persistedKeys = usePersistedKeys(state.selectionManager.focusedKey);
  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <div
      {...mergeProps(DOMProps, renderProps, gridProps, focusProps)}
      ref={ref}
      data-empty={state.collection.size === 0 || undefined}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}>
      <SharedElementTransition>
        {state.collection.size === 0 && props.renderEmptyState
          ? props.renderEmptyState(renderValues)
          : <CollectionRoot collection={state.collection} persistedKeys={persistedKeys} />}
      </SharedElementTransition>
    </div>
  );
}

export interface TagRenderProps extends Omit<ItemRenderProps, 'allowsDragging' | 'isDragging' | 'isDropTarget'> {
  /**
   * Whether the tag group allows items to be removed.
   * @selector [data-allows-removing]
   */
  allowsRemoving: boolean
}

export interface TagProps extends RenderProps<TagRenderProps>, LinkDOMProps, HoverEvents, PressEvents, Omit<GlobalDOMAttributes<HTMLDivElement>, 'onClick'> {
  /** A unique id for the tag. */
  id?: Key,
  /**
   * A string representation of the tags's contents, used for accessibility.
   * Required if children is not a plain text string.
   */
  textValue?: string,
  /** Whether the tag is disabled. */
  isDisabled?: boolean
}

/**
 * A Tag is an individual item within a TagList.
 */
export const Tag = /*#__PURE__*/ createLeafComponent(ItemNode, (props: TagProps, forwardedRef: ForwardedRef<HTMLDivElement>, item: Node<unknown>) => {
  let state = useContext(ListStateContext)!;
  let ref = useObjectRef<HTMLDivElement>(forwardedRef);
  let {focusProps, isFocusVisible} = useFocusRing({within: false});
  let {rowProps, gridCellProps, removeButtonProps, ...states} = useTag({item}, state, ref);

  let {hoverProps, isHovered} = useHover({
    isDisabled: !states.allowsSelection,
    onHoverStart: item.props.onHoverStart,
    onHoverChange: item.props.onHoverChange,
    onHoverEnd: item.props.onHoverEnd
  });

  let renderProps = useRenderProps({
    ...props,
    id: undefined,
    children: item.rendered,
    defaultClassName: 'react-aria-Tag',
    values: {
      ...states,
      isFocusVisible,
      isHovered,
      selectionMode: state.selectionManager.selectionMode,
      selectionBehavior: state.selectionManager.selectionBehavior
    }
  });

  useEffect(() => {
    if (!item.textValue && process.env.NODE_ENV !== 'production') {
      console.warn('A `textValue` prop is required for <Tag> elements with non-plain text children for accessibility.');
    }
  }, [item.textValue]);

  let DOMProps = filterDOMProps(props as any, {global: true});
  delete DOMProps.id;
  delete DOMProps.onClick;

  return (
    <div
      ref={ref}
      {...mergeProps(DOMProps, renderProps, rowProps, focusProps, hoverProps)}
      data-selected={states.isSelected || undefined}
      data-disabled={states.isDisabled || undefined}
      data-hovered={isHovered || undefined}
      data-focused={states.isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-pressed={states.isPressed || undefined}
      data-allows-removing={states.allowsRemoving || undefined}
      data-selection-mode={state.selectionManager.selectionMode === 'none' ? undefined : state.selectionManager.selectionMode}>
      <div {...gridCellProps} style={{display: 'contents'}}>
        <Provider
          values={[
            [ButtonContext, {
              slots: {
                remove: removeButtonProps
              }
            }],
            [CollectionRendererContext, DefaultCollectionRenderer],
            [SelectionIndicatorContext, {isSelected: states.isSelected}]
          ]}>
          {renderProps.children}
        </Provider>
      </div>
    </div>
  );
});
