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

import {AriaLabelingProps, forwardRefType, GlobalDOMAttributes} from '@react-types/shared';
import {
  ClassNameOrFunction,
  ContextValue,
  dom,
  DOMProps,
  RenderProps,
  SlotProps,
  useContextProps,
  useRenderProps
} from './utils';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {getOwnerDocument} from 'react-aria/private/utils/domHelpers';
import intlMessages from '../intl/*.json';
import {mergeProps} from 'react-aria/mergeProps';
import React, {
  createContext,
  ForwardedRef,
  forwardRef,
  RefObject,
  useContext,
  useState
} from 'react';
import {useId} from 'react-aria/useId';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useObjectRef} from 'react-aria/useObjectRef';

export interface StepListRenderProps {}

export interface StepListProps
  extends
    SlotProps,
    RenderProps<StepListRenderProps, 'ol'>,
    GlobalDOMAttributes<HTMLOListElement>,
    AriaLabelingProps {
  /**
   * The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the
   * element. A function may be provided to compute the class based on component state.
   *
   * @default 'react-aria-StepList'
   */
  className?: ClassNameOrFunction<StepListRenderProps>;
  /**
   * The `id` of the currently selected `StepListItem`. Steps rendered before it are marked as
   * completed, and steps rendered after it are marked as not completed.
   */
  selectedId: string;
}

export const StepListContext = createContext<ContextValue<StepListProps, HTMLOListElement>>(null);

interface StepListState {
  /** The `id` of the currently selected step. */
  selectedId: string;
  /** Identifies the steps belonging to this list so an item can locate its sibling steps. */
  groupId: string;
}

const InternalStepListContext = createContext<StepListState | null>(null);

/**
 * A StepList displays the steps of a multi step process, and which of them the user has completed.
 */
export const StepList = /*#__PURE__*/ (forwardRef as forwardRefType)(function StepList(
  props: StepListProps,
  ref: ForwardedRef<HTMLOListElement>
) {
  [props, ref] = useContextProps(props, ref, StepListContext);
  let {selectedId} = props;
  let groupId = useId();

  let renderProps = useRenderProps({
    ...props,
    values: {},
    defaultClassName: 'react-aria-StepList'
  });

  let DOMProps = filterDOMProps(props, {labelable: true});

  return (
    <InternalStepListContext.Provider value={{selectedId, groupId}}>
      <dom.ol
        {...mergeProps(DOMProps, renderProps)}
        role="list"
        ref={ref}
        slot={props.slot || undefined}>
        {renderProps.children}
      </dom.ol>
    </InternalStepListContext.Provider>
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
  /** A unique id for the step, which is compared against the `selectedId` of the `StepList`. */
  id: string;
}

function useStepListItem(
  props: StepListItemProps,
  state: StepListState | null,
  ref: RefObject<HTMLLIElement | null>
) {
  let {id} = props;
  let groupId = state?.groupId;
  let selectedId = state?.selectedId;
  let isCurrent = id === selectedId;
  // A step is completed if it is rendered before the current step. This can only be determined once
  // all of the steps in the group have been rendered, so it is resolved against the DOM.
  let [isCompleted, setCompleted] = useState(false);

  useLayoutEffect(() => {
    if (!ref.current || groupId == null || isCurrent) {
      setCompleted(false);
      return;
    }

    let currentItem = getOwnerDocument(ref.current).querySelector(
      `[data-steplist-group-id="${groupId}"][data-current]`
    );
    setCompleted(
      currentItem != null &&
        (currentItem.compareDocumentPosition(ref.current) & Node.DOCUMENT_POSITION_PRECEDING) !== 0
    );
  }, [isCurrent, selectedId, groupId, ref]);

  return {
    itemProps: {
      'aria-current': isCurrent ? ('step' as const) : undefined,
      'data-steplist-group-id': groupId,
      'data-current': isCurrent || undefined,
      'data-completed': isCompleted || undefined
    },
    isCurrent,
    isCompleted
  };
}

/**
 * A StepListItem represents an individual step within a `<StepList>`.
 */
export const StepListItem = /*#__PURE__*/ (forwardRef as forwardRefType)(function StepListItem(
  props: StepListItemProps,
  ref: ForwardedRef<HTMLLIElement>
) {
  let objRef = useObjectRef(ref);
  let state = useContext(InternalStepListContext);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, 'react-aria-components');
  let {itemProps, isCurrent, isCompleted} = useStepListItem(props, state, objRef);
  let hiddenId = useId();

  let renderProps = useRenderProps({
    ...props,
    values: {isCurrent, isCompleted},
    defaultClassName: 'react-aria-StepListItem'
  });

  let DOMProps = filterDOMProps(props, {labelable: true});
  // `id` identifies the step rather than the DOM element, so it is not forwarded to the DOM.
  // TODO IS THIS WEIRD OR WRONG??
  delete DOMProps.id;

  let message = stringFormatter.format('stepListItemNotCompleted');
  if (isCurrent) {
    message = stringFormatter.format('stepListItemCurrent');
  } else if (isCompleted) {
    message = stringFormatter.format('stepListItemCompleted');
  }

  return (
    <StepListItemContext.Provider value={{hiddenId}}>
      <dom.li {...mergeProps(DOMProps, renderProps, itemProps)} role="listitem" ref={objRef}>
        <span hidden id={hiddenId}>
          {message}
        </span>
        {renderProps.children}
      </dom.li>
    </StepListItemContext.Provider>
  );
});

interface StepListItemContentProps extends DOMProps {}
const StepListItemContext = createContext<{hiddenId: string | undefined} | undefined>(undefined);

// Need this so I can get an id on the contents so that the announcement makes sense. It lands on this element, not the `li` itself.
export const StepListItemContent = /*#__PURE__*/ (forwardRef as forwardRefType)(
  function StepListItemContent(props: StepListItemContentProps, ref: ForwardedRef<HTMLDivElement>) {
    let context = useContext(StepListItemContext);
    let objRef = useObjectRef(ref);
    let DOMProps = filterDOMProps(props, {labelable: true});
    let id = useId();

    return (
      <dom.div
        {...DOMProps}
        ref={objRef}
        id={id}
        role="link" // No role === default group which means three arrow keys to get through each item
        className="react-aria-StepListItemContent"
        aria-labelledby={`${context?.hiddenId} ${id}`}>
        {props.children}
      </dom.div>
    );
  }
);
