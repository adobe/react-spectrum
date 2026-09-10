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
  Collection as ICollection,
  Key,
  Node,
  RefObject
} from '@react-types/shared';
import {AriaStepListProps, useStepList, useStepListItem} from 'react-aria/useStepList';
import {
  ClassNameOrFunction,
  ContextValue,
  dom,
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
import {StepListState, useStepListState} from 'react-stately/useStepListState';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useId} from 'react-aria/useId';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useNumberFormatter} from 'react-aria/useNumberFormatter';
import {useObjectRef} from 'react-aria/useObjectRef';
import {VisuallyHidden} from 'react-aria/VisuallyHidden';

export interface StepListProps<T>
  extends
    Omit<CollectionProps<T>, 'disabledKeys'>,
    Omit<AriaStepListProps<T>, 'children'>,
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
  /** Whether the step list is disabled. Steps will not be focusable or interactive. */
  isDisabled?: boolean;
  /** Whether the step list is read only. Steps will be focusable but non-interactive. */
  isReadOnly?: boolean;
}

export const StepListContext =
  createContext<ContextValue<StepListProps<any>, HTMLOListElement>>(null);
export const StepListStateContext = createContext<StepListState<any> | null>(null);

/**
 * A StepList displays a sequence of steps that guides a user through a task, indicating
 * which steps are completed, current, and upcoming.
 */
export const StepList = /*#__PURE__*/ (forwardRef as forwardRefType)(function StepList<
  T extends object
>(props: StepListProps<T>, ref: ForwardedRef<HTMLOListElement>) {
  [props, ref] = useContextProps(props, ref, StepListContext);

  return (
    <CollectionBuilder content={<Collection {...props} />}>
      {collection => <StepListInner props={props} collection={collection} listRef={ref} />}
    </CollectionBuilder>
  );
});

interface StepListInnerProps<T extends object> {
  props: StepListProps<T>;
  collection: ICollection<Node<T>>;
  listRef: ForwardedRef<HTMLOListElement>;
}

function StepListInner<T extends object>({props, collection, listRef: ref}: StepListInnerProps<T>) {
  let {CollectionRoot} = useContext(CollectionRendererContext);
  let state = useStepListState<T>({...props, collection, children: undefined});
  let {listProps} = useStepList(
    {...props, children: undefined},
    state,
    ref as RefObject<HTMLOListElement | null>
  );
  let DOMProps = filterDOMProps(props, {global: true, labelable: true});

  return (
    <dom.ol
      render={props.render}
      ref={ref}
      {...mergeProps(DOMProps, listProps)}
      slot={props.slot || undefined}
      style={props.style}
      className={props.className ?? 'react-aria-StepList'}>
      <StepListStateContext.Provider value={state}>
        <StepListContext.Provider value={props}>
          <CollectionRoot collection={collection} />
        </StepListContext.Provider>
      </StepListStateContext.Provider>
    </dom.ol>
  );
}

export interface StepListItemRenderProps {
  /**
   * Whether the step is the currently selected step.
   *
   * @selector [data-current]
   */
  isCurrent: boolean;
  /**
   * Whether the step has been completed.
   *
   * @selector [data-completed]
   */
  isCompleted: boolean;
  /**
   * Whether the step is disabled (not selectable).
   *
   * @selector [data-disabled]
   */
  isDisabled: boolean;
  /**
   * Whether the step is currently hovered with a mouse.
   *
   * @selector [data-hovered]
   */
  isHovered: boolean;
  /**
   * Whether the step is currently focused.
   *
   * @selector [data-focused]
   */
  isFocused: boolean;
  /**
   * Whether the step is currently keyboard focused.
   *
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean;
  /**
   * Whether the step is currently in a pressed state.
   *
   * @selector [data-pressed]
   */
  isPressed: boolean;
}

export interface StepListItemProps
  extends
    RenderProps<StepListItemRenderProps, 'li'>,
    AriaLabelingProps,
    GlobalDOMAttributes<HTMLLIElement> {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-StepListItem'
   */
  className?: ClassNameOrFunction<StepListItemRenderProps>;
  /**
   * A unique id for the step.
   */
  id?: Key;
}

class StepListItemNode extends CollectionNode<unknown> {
  static readonly type = 'item';
}

/**
 * A StepListItem represents an individual step in a `<StepList>`.
 */
export const StepListItem = /*#__PURE__*/ createLeafComponent(
  StepListItemNode,
  function StepListItem(
    props: StepListItemProps,
    forwardedRef: ForwardedRef<HTMLLIElement>,
    node: Node<unknown>
  ) {
    let ref = useObjectRef<HTMLLIElement>(forwardedRef);
    let state = useContext(StepListStateContext)!;
    let stringFormatter = useLocalizedStringFormatter(intlMessages, 'react-aria-components');
    let numberFormatter = useNumberFormatter();
    let {stepProps, ...states} = useStepListItem({key: node.key}, state, ref);

    let isCurrent = states.isSelected;
    let isCompleted = state.isCompleted(node.key);

    let {focusProps, isFocused, isFocusVisible} = useFocusRing();
    let {hoverProps, isHovered} = useHover({
      isDisabled: states.isDisabled || isCurrent
    });

    let stepStateText: string;
    if (isCurrent) {
      stepStateText = stringFormatter.format('stepListItemCurrent');
    } else if (isCompleted) {
      stepStateText = stringFormatter.format('stepListItemCompleted');
    } else {
      stepStateText = stringFormatter.format('stepListItemNotCompleted');
    }

    let renderProps = useRenderProps({
      ...node.props,
      children: node.rendered,
      defaultClassName: 'react-aria-StepListItem',
      values: {
        isCurrent,
        isCompleted,
        isDisabled: states.isDisabled,
        isHovered,
        isFocused,
        isFocusVisible,
        isPressed: states.isPressed,
        stepIndex: node.index ?? 0
      }
    });

    let DOMProps = filterDOMProps(props as any, {global: true, labelable: true});
    delete DOMProps.id;

    return (
      <dom.li
        {...mergeProps(DOMProps, renderProps, stepProps, focusProps, hoverProps)}
        ref={ref}
        data-current={isCurrent || undefined}
        data-completed={isCompleted || undefined}
        data-disabled={states.isDisabled || undefined}
        data-hovered={isHovered || undefined}
        data-focused={isFocused || undefined}
        data-focus-visible={isFocusVisible || undefined}
        data-pressed={states.isPressed || undefined}>
        <VisuallyHidden elementType="span">{stepStateText}</VisuallyHidden>
        {renderProps.children}
      </dom.li>
    );
  }
);
