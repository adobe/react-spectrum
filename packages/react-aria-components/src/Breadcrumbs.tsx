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
import {AriaBreadcrumbsProps, mergeProps, useBreadcrumbs, useFocusRing} from 'react-aria';
import {BaseCollection, Collection, CollectionBuilder, createLeafComponent} from '@react-aria/collections';
import {CollectionProps, CollectionRendererContext} from './Collection';
import {
  ContextValue,
  RenderProps,
  SlotProps,
  StyleRenderProps,
  useContextProps,
  useRenderProps,
  useSlottedContext
} from './utils';
import {filterDOMProps} from '@react-aria/utils';
import {forwardRefType, Key} from '@react-types/shared';
import {LinkContext} from './Link';
import {Node} from 'react-stately';
import React, {createContext, ForwardedRef, forwardRef, RefObject, useContext} from 'react';

/**
 * 1. Should I expose collection interface?
 * 2. Maybe there's a possibility of unwanted props?
 */
export interface BreadCrumbsRenderProps {
  isDisabled: boolean,
  isFocusWithin: boolean,
  isFocusVisible: boolean
}

export interface BreadcrumbsProps<T> extends Omit<CollectionProps<T>, 'disabledKeys'>, AriaBreadcrumbsProps, StyleRenderProps<BreadCrumbsRenderProps>, SlotProps {
  /** Whether the breadcrumbs are disabled. */
  isDisabled?: boolean,
  /** Handler that is called when a breadcrumb is clicked. */
  onAction?: (key: Key) => void
}

export const BreadcrumbsContext = createContext<ContextValue<BreadcrumbsProps<any>, HTMLOListElement>>(null);

function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>, ref: ForwardedRef<HTMLOListElement>) {
  [props, ref] = useContextProps(props, ref, BreadcrumbsContext);
  return (
    <CollectionBuilder content={<Collection {...props} />}>
      {(collection) => <BreadCrumbsInner breadCrumbsRef={ref} props={props} collection={collection} />}
    </CollectionBuilder>
  );
};

interface BreadCrumbsInnerProps<T> {
  props: BreadcrumbsProps<T>,
  collection: BaseCollection<unknown>,
  breadCrumbsRef: RefObject<HTMLOListElement | null>
}

function BreadCrumbsInner<T extends object>({props, collection, breadCrumbsRef}: BreadCrumbsInnerProps<T>) {
  let {CollectionRoot} = useContext(CollectionRendererContext);
  let {navProps} = useBreadcrumbs(props);
  const {isFocused, isFocusVisible, focusProps} = useFocusRing({within: true});

  let renderProps = useRenderProps({
    defaultClassName: 'react-aria-Breadcrumbs',
    className: props.className,
    style: props.style,
    values: {
      isDisabled: props.isDisabled || false,
      isFocusWithin: isFocused,
      isFocusVisible
    }
  });

  return (
    <ol
      {...mergeProps(navProps, focusProps)}
      {...renderProps}
      ref={breadCrumbsRef}
      slot={props.slot || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-focus-within={isFocused || undefined}
      data-disabled={props.isDisabled || undefined}>
      <BreadcrumbsContext.Provider value={props}>
        <CollectionRoot collection={collection} />
      </BreadcrumbsContext.Provider>
    </ol>
  );
}

/**
 * Breadcrumbs display a hierarchy of links to the current page or resource in an application.
 */
const _Breadcrumbs = /*#__PURE__*/ (forwardRef as forwardRefType)(Breadcrumbs);
export {_Breadcrumbs as Breadcrumbs};

export interface BreadcrumbRenderProps {
  /**
   * Whether the breadcrumb is for the current page.
   * @selector [data-current]
   */
  isCurrent: boolean,
  /**
   * Whether the breadcrumb is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean
}

export interface BreadcrumbProps extends RenderProps<BreadcrumbRenderProps>  {
  /** A unique id for the breadcrumb, which will be passed to `onAction` when the breadcrumb is pressed. */
  id?: Key
}

/**
 * A Breadcrumb represents an individual item in a `<Breadcrumbs>` list.
 */
export const Breadcrumb = /*#__PURE__*/ createLeafComponent('item', function Breadcrumb(props: BreadcrumbProps, ref: ForwardedRef<HTMLLIElement>, node: Node<unknown>) {
  // Recreating useBreadcrumbItem because we want to use composition instead of having the link builtin.
  let isCurrent = node.nextKey == null;
  let {isDisabled, onAction} = useSlottedContext(BreadcrumbsContext)!;
  let linkProps = {
    'aria-current': isCurrent ? 'page' : null,
    isDisabled: isDisabled || isCurrent,
    onPress: () => onAction?.(node.key)
  };

  let renderProps = useRenderProps({
    ...node.props,
    children: node.rendered,
    values: {isDisabled: isDisabled || isCurrent, isCurrent},
    defaultClassName: 'react-aria-Breadcrumb'
  });

  return (
    <li
      {...filterDOMProps(props as any)}
      {...renderProps}
      ref={ref}
      data-disabled={isDisabled || isCurrent || undefined}
      data-current={isCurrent || undefined}>
      <LinkContext.Provider value={linkProps}>
        {renderProps.children}
      </LinkContext.Provider>
    </li>
  );
});
