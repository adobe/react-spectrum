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

import {AriaListBoxOptions, AriaListBoxProps, mergeProps, useHover, useListBox, useListBoxSection, useOption} from 'react-aria';
import {CollectionProps, ItemProps, useCachedChildren, useCollection} from './Collection';
import {ContextValue, forwardRefType, Provider, SlotProps, StyleProps, useContextProps, useRenderProps} from './utils';
import {filterDOMProps} from '@react-aria/utils';
import {isFocusVisible} from '@react-aria/interactions';
import {ListState, Node, OverlayTriggerState, SelectionBehavior, useListState} from 'react-stately';
import React, {createContext, ForwardedRef, forwardRef, RefObject, useContext, useRef} from 'react';
import {Separator, SeparatorContext} from './Separator';
import {TextContext} from './Text';

export interface ListBoxProps<T> extends Omit<AriaListBoxProps<T>, 'children'>, CollectionProps<T>, StyleProps, SlotProps {
  /** How multiple selection should behave in the collection. */
  selectionBehavior?: SelectionBehavior
}

interface ListBoxContextValue<T> extends ListBoxProps<T> {
  state?: ListState<T> & OverlayTriggerState
}

interface InternalListBoxContextValue {
  state: ListState<unknown>,
  shouldFocusOnHover: boolean
}

export const ListBoxContext = createContext<ContextValue<ListBoxContextValue<any>, HTMLDivElement>>(null);
const InternalListBoxContext = createContext<InternalListBoxContextValue>(null);

function ListBox<T>(props: ListBoxProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ListBoxContext);
  let state = (props as ListBoxContextValue<T>).state;

  if (state) {
    return state.isOpen ? <ListBoxInner state={state} props={props} listBoxRef={ref} /> : null;
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
const _ListBox = (forwardRef as forwardRefType)(ListBox);
export {_ListBox as ListBox};

interface ListBoxInnerProps<T> {
  state: ListState<T>,
  props: ListBoxProps<T> & AriaListBoxOptions<T>,
  listBoxRef: RefObject<HTMLDivElement>
}

function ListBoxInner<T>({state, props, listBoxRef}: ListBoxInnerProps<T>) {
  let {listBoxProps} = useListBox(props, state, listBoxRef);

  let children = useCachedChildren({
    items: state.collection,
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

  return (
    <div
      {...filterDOMProps(props)}
      {...listBoxProps}
      ref={listBoxRef}
      slot={props.slot}
      style={props.style}
      className={props.className ?? 'react-aria-ListBox'}>
      <Provider
        values={[
          [InternalListBoxContext, {state, shouldFocusOnHover: props.shouldFocusOnHover}],
          [SeparatorContext, {elementType: 'li'}]
        ]}>
        {children}
      </Provider>
    </div>
  );
}

interface ListBoxSectionProps<T> extends StyleProps {
  section: Node<T>
}

function ListBoxSection<T>({section, className, style, ...otherProps}: ListBoxSectionProps<T>) {
  let {state} = useContext(InternalListBoxContext);
  let {headingProps, groupProps} = useListBoxSection({
    heading: section.rendered,
    'aria-label': section['aria-label']
  });

  let children = useCachedChildren({
    items: state.collection.getChildren(section.key),
    children: item => {
      if (item.type !== 'item') {
        throw new Error('Only items are allowed within a section');
      }

      return <Option item={item} />;
    }
  });

  return (
    <section
      {...filterDOMProps(otherProps)}
      {...groupProps}
      className={className || section.props?.className || 'react-aria-Section'}
      style={style || section.props?.style}>
      {section.rendered &&
        <header {...headingProps}>
          {section.rendered}
        </header>
      }
      {children}
    </section>
  );
}

interface OptionProps<T> {
  item: Node<T>
}

function Option<T>({item}: OptionProps<T>) {
  let ref = useRef();
  let {state, shouldFocusOnHover} = useContext(InternalListBoxContext);
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

  let props: ItemProps<T> = item.props;
  let focusVisible = states.isFocused && isFocusVisible();
  let renderProps = useRenderProps({
    ...props,
    id: undefined,
    children: item.rendered,
    defaultClassName: 'react-aria-Item',
    values: {
      ...states,
      isHovered,
      isFocusVisible: focusVisible,
      selectionMode: state.selectionManager.selectionMode,
      selectionBehavior: state.selectionManager.selectionBehavior
    }
  });

  return (
    <div
      {...mergeProps(optionProps, hoverProps)}
      {...renderProps}
      ref={ref}
      data-hovered={isHovered || undefined}
      data-focused={states.isFocused || undefined}
      data-focus-visible={focusVisible || undefined}
      data-pressed={states.isPressed || undefined}>
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
  );
}
