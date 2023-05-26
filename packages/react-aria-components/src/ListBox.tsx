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

import {AriaListBoxOptions, AriaListBoxProps, DraggableItemResult, DragPreviewRenderer, DroppableCollectionResult, DroppableItemResult, FocusScope, ListKeyboardDelegate, mergeProps, useFocusRing, useHover, useListBox, useListBoxSection, useOption} from 'react-aria';
import {CollectionProps, ItemProps, useCachedChildren, useCollection} from './Collection';
import {ContextValue, forwardRefType, HiddenContext, Provider, SlotProps, StyleProps, StyleRenderProps, useContextProps, useRenderProps, useSlot} from './utils';
import {DragAndDropHooks, DropIndicator, DropIndicatorContext, DropIndicatorProps} from './useDragAndDrop';
import {DraggableCollectionState, DroppableCollectionState, ListState, Node, SelectionBehavior, useListState} from 'react-stately';
import {filterDOMProps, mergeRefs, useObjectRef} from '@react-aria/utils';
import {Header} from './Header';
import React, {createContext, ForwardedRef, forwardRef, ReactNode, RefObject, useContext, useEffect, useRef} from 'react';
import {Separator, SeparatorContext} from './Separator';
import {TextContext} from './Text';

export interface ListBoxRenderProps {
  /**
   * Whether the listbox has no items and should display its empty state.
   * @selector [data-empty]
   */
  isEmpty: boolean,
  /**
   * Whether the listbox is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the listbox is currently keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the listbox is currently the active drop target.
   * @selector [data-drop-target]
   */
  isDropTarget: boolean
}

export interface ListBoxProps<T> extends Omit<AriaListBoxProps<T>, 'children'>, CollectionProps<T>, StyleRenderProps<ListBoxRenderProps>, SlotProps {
  /** How multiple selection should behave in the collection. */
  selectionBehavior?: SelectionBehavior,
  /** The drag and drop hooks returned by `useDragAndDrop` used to enable drag and drop behavior for the ListBox. */
  dragAndDropHooks?: DragAndDropHooks,
  /** Provides content to display when there are no items in the list. */
  renderEmptyState?: () => ReactNode
}

interface ListBoxContextValue<T> extends ListBoxProps<T> {
  state?: ListState<T>
}

interface InternalListBoxContextValue {
  state: ListState<unknown>,
  shouldFocusOnHover?: boolean,
  dragAndDropHooks?: DragAndDropHooks,
  dragState?: DraggableCollectionState,
  dropState?: DroppableCollectionState
}

export const ListBoxContext = createContext<ContextValue<ListBoxContextValue<any>, HTMLDivElement>>(null);
const InternalListBoxContext = createContext<InternalListBoxContextValue | null>(null);

function ListBox<T>(props: ListBoxProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ListBoxContext);
  let state = (props as ListBoxContextValue<T>).state;
  let isHidden = useContext(HiddenContext);

  if (state) {
    return isHidden ? null : <ListBoxInner state={state} props={props} listBoxRef={ref} />;
  }

  return <ListBoxPortal props={props} listBoxRef={ref} />;
}

function ListBoxPortal({props, listBoxRef}) {
  let {portal, collection} = useCollection(props);
  props = {...props, collection, children: null, items: null};
  let state = useListState(props);
  return (
    <>
      {portal}
      <ListBoxInner state={state} props={props} listBoxRef={listBoxRef} />
    </>
  );
}

/**
 * A listbox displays a list of options and allows a user to select one or more of them.
 */
const _ListBox = /*#__PURE__*/ (forwardRef as forwardRefType)(ListBox);
export {_ListBox as ListBox};

interface ListBoxInnerProps<T> {
  state: ListState<T>,
  props: ListBoxProps<T> & AriaListBoxOptions<T>,
  listBoxRef: RefObject<HTMLDivElement>
}

function ListBoxInner<T>({state, props, listBoxRef}: ListBoxInnerProps<T>) {
  let {dragAndDropHooks} = props;
  let {collection, selectionManager} = state;
  let isListDraggable = !!dragAndDropHooks?.useDraggableCollectionState;
  let isListDroppable = !!dragAndDropHooks?.useDroppableCollectionState;
  let {listBoxProps} = useListBox({
    ...props,
    shouldSelectOnPressUp: isListDraggable || props.shouldSelectOnPressUp
  }, state, listBoxRef);

  let children = useCachedChildren({
    items: collection,
    children: (item: Node<T>) => {
      switch (item.type) {
        case 'section':
          return <ListBoxSection section={item} />;
        case 'separator':
          return <Separator {...item.props} />;
        case 'item':
          return <Option item={item} />;
        default:
          throw new Error('Unsupported node type in Menu: ' + item.type);
      }
    }
  });

  let dragHooksProvided = useRef(isListDraggable);
  let dropHooksProvided = useRef(isListDroppable);
  if (dragHooksProvided.current !== isListDraggable) {
    console.warn('Drag hooks were provided during one render, but not another. This should be avoided as it may produce unexpected behavior.');
  }
  if (dropHooksProvided.current !== isListDroppable) {
    console.warn('Drop hooks were provided during one render, but not another. This should be avoided as it may produce unexpected behavior.');
  }

  let dragState: DraggableCollectionState | undefined = undefined;
  let dropState: DroppableCollectionState | undefined = undefined;
  let droppableCollection: DroppableCollectionResult | undefined = undefined;
  let isRootDropTarget = false;
  let dragPreview: JSX.Element | null = null;
  let preview = useRef<DragPreviewRenderer>(null);

  if (isListDraggable && dragAndDropHooks) {
    dragState = dragAndDropHooks.useDraggableCollectionState!({
      collection,
      selectionManager,
      preview: dragAndDropHooks.renderDragPreview ? preview : undefined
    });
    dragAndDropHooks.useDraggableCollection!({}, dragState, listBoxRef);

    let DragPreview = dragAndDropHooks.DragPreview!;
    dragPreview = dragAndDropHooks.renderDragPreview
      ? <DragPreview ref={preview}>{dragAndDropHooks.renderDragPreview}</DragPreview>
      : null;
  }

  if (isListDroppable && dragAndDropHooks) {
    dropState = dragAndDropHooks.useDroppableCollectionState!({
      collection,
      selectionManager
    });

    let keyboardDelegate = props.keyboardDelegate || new ListKeyboardDelegate(
      collection,
      selectionManager.disabledBehavior === 'selection' ? new Set() : selectionManager.disabledKeys,
      listBoxRef
    );
    let dropTargetDelegate = dragAndDropHooks.dropTargetDelegate || new dragAndDropHooks.ListDropTargetDelegate(collection, listBoxRef);
    droppableCollection = dragAndDropHooks.useDroppableCollection!({
      keyboardDelegate,
      dropTargetDelegate
    }, dropState, listBoxRef);

    isRootDropTarget = dropState.isDropTarget({type: 'root'});
  }

  let {focusProps, isFocused, isFocusVisible} = useFocusRing();
  let renderProps = useRenderProps({
    className: props.className,
    style: props.style,
    defaultClassName: 'react-aria-ListBox',
    values: {
      isDropTarget: isRootDropTarget,
      isEmpty: state.collection.size === 0,
      isFocused,
      isFocusVisible
    }
  });

  let emptyState: JSX.Element | null = null;
  if (state.collection.size === 0 && props.renderEmptyState) {
    emptyState = (
      <div
        // eslint-disable-next-line
        role="option"
        style={{display: 'contents'}}>
        {props.renderEmptyState()}
      </div>
    );
  }

  return (
    <FocusScope>
      <div
        {...filterDOMProps(props)}
        {...mergeProps(listBoxProps, focusProps, droppableCollection?.collectionProps)}
        {...renderProps}
        ref={listBoxRef}
        slot={props.slot}
        data-drop-target={isRootDropTarget || undefined}
        data-empty={state.collection.size === 0 || undefined}
        data-focused={isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}>
        <Provider
          values={[
            [InternalListBoxContext, {state, shouldFocusOnHover: props.shouldFocusOnHover, dragAndDropHooks, dragState, dropState}],
            [SeparatorContext, {elementType: 'li'}],
            [DropIndicatorContext, {render: ListBoxDropIndicatorWrapper}]
          ]}>
          {children}
        </Provider>
        {emptyState}
        {dragPreview}
      </div>
    </FocusScope>
  );
}

interface ListBoxSectionProps<T> extends StyleProps {
  section: Node<T>
}

function ListBoxSection<T>({section, className, style, ...otherProps}: ListBoxSectionProps<T>) {
  let {state} = useContext(InternalListBoxContext)!;
  let [headingRef, heading] = useSlot();
  let {headingProps, groupProps} = useListBoxSection({
    heading,
    'aria-label': section['aria-label'] ?? undefined
  });

  let children = useCachedChildren({
    items: state.collection.getChildren!(section.key),
    children: item => {
      switch (item.type) {
        case 'header': {
          let {ref, ...otherProps} = item.props;
          return (
            <Header
              {...headingProps}
              {...otherProps}
              ref={mergeRefs(headingRef, ref)}>
              {item.rendered}
            </Header>
          );
        }
        case 'item':
          return <Option item={item} />;
        default:
          throw new Error('Unsupported element type in Section: ' + item.type);
      }
    }
  });

  return (
    <section
      {...filterDOMProps(otherProps)}
      {...groupProps}
      className={className || section.props?.className || 'react-aria-Section'}
      style={style || section.props?.style}
      ref={section.props.ref}>
      {children}
    </section>
  );
}

interface OptionProps<T> {
  item: Node<T>
}

function Option<T>({item}: OptionProps<T>) {
  let ref = useObjectRef<HTMLDivElement>(item.props.ref);
  let {state, shouldFocusOnHover, dragAndDropHooks, dragState, dropState} = useContext(InternalListBoxContext)!;
  let {optionProps, labelProps, descriptionProps, ...states} = useOption(
    {key: item.key},
    state,
    ref
  );

  let {hoverProps, isHovered} = useHover({
    isDisabled: shouldFocusOnHover || (!states.allowsSelection && !states.hasAction)
  });

  if (shouldFocusOnHover) {
    hoverProps = {};
    isHovered = states.isFocused;
  }

  let draggableItem: DraggableItemResult | null = null;
  if (dragState && dragAndDropHooks) {
    draggableItem = dragAndDropHooks.useDraggableItem!({key: item.key}, dragState);
  }

  let droppableItem: DroppableItemResult | null = null;
  if (dropState && dragAndDropHooks) {
    droppableItem = dragAndDropHooks.useDroppableItem!({
      target: {type: 'item', key: item.key, dropPosition: 'on'}
    }, dropState, ref);
  }

  let props: ItemProps<T> = item.props;
  let isDragging = dragState && dragState.isDragging(item.key);
  let renderProps = useRenderProps({
    ...props,
    id: undefined,
    children: item.rendered,
    defaultClassName: 'react-aria-Item',
    values: {
      ...states,
      isHovered,
      selectionMode: state.selectionManager.selectionMode,
      selectionBehavior: state.selectionManager.selectionBehavior,
      allowsDragging: !!dragState,
      isDragging,
      isDropTarget: droppableItem?.isDropTarget
    }
  });

  let renderDropIndicator = dragAndDropHooks?.renderDropIndicator || (target => <DropIndicator target={target} />);

  useEffect(() => {
    if (!item.textValue) {
      console.warn('A `textValue` prop is required for <Item> elements with non-plain text children in order to support accessibility features such as type to select.');
    }
  }, [item.textValue]);

  return (
    <>
      {dragAndDropHooks?.useDropIndicator &&
        renderDropIndicator({type: 'item', key: item.key, dropPosition: 'before'})
      }
      <div
        {...mergeProps(filterDOMProps(props as any), optionProps, hoverProps, draggableItem?.dragProps, droppableItem?.dropProps)}
        {...renderProps}
        ref={ref}
        data-hovered={isHovered || undefined}
        data-focused={states.isFocused || undefined}
        data-focus-visible={states.isFocusVisible || undefined}
        data-pressed={states.isPressed || undefined}
        data-dragging={isDragging || undefined}
        data-drop-target={droppableItem?.isDropTarget || undefined}>
        <Provider
          values={[
            [TextContext, {
              slots: {
                label: labelProps,
                description: descriptionProps
              }
            }]
          ]}>
          {renderProps.children}
        </Provider>
      </div>
      {dragAndDropHooks?.useDropIndicator && state.collection.getKeyAfter(item.key) == null &&
        renderDropIndicator({type: 'item', key: item.key, dropPosition: 'after'})
      }
    </>
  );
}

function ListBoxDropIndicatorWrapper(props: DropIndicatorProps, ref: ForwardedRef<HTMLElement>) {
  ref = useObjectRef(ref);
  let {dragAndDropHooks, dropState} = useContext(InternalListBoxContext)!;
  let {dropIndicatorProps, isHidden, isDropTarget} = dragAndDropHooks!.useDropIndicator!(
    props,
    dropState!,
    ref
  );

  if (isHidden) {
    return null;
  }

  return (
    <ListBoxtDropIndicatorForwardRef {...props} dropIndicatorProps={dropIndicatorProps} isDropTarget={isDropTarget} ref={ref} />
  );
}

interface ListBoxDropIndicatorProps extends DropIndicatorProps {
  dropIndicatorProps: React.HTMLAttributes<HTMLElement>,
  isDropTarget: boolean
}

function ListBoxtDropIndicator(props: ListBoxDropIndicatorProps, ref: ForwardedRef<HTMLElement>) {
  let {
    dropIndicatorProps,
    isDropTarget,
    ...otherProps
  } = props;

  let renderProps = useRenderProps({
    ...otherProps,
    defaultClassName: 'react-aria-DropIndicator',
    values: {
      isDropTarget
    }
  });

  return (
    <div
      {...dropIndicatorProps}
      {...renderProps}
      // eslint-disable-next-line
      role="option"
      ref={ref as RefObject<HTMLDivElement>}
      data-drop-target={isDropTarget || undefined} />
  );
}

const ListBoxtDropIndicatorForwardRef = forwardRef(ListBoxtDropIndicator);
