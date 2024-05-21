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
import {AriaBreadcrumbsProps} from 'react-aria';
import {Collection, Node} from 'react-stately';
import {CollectionProps, useCollection, useSSRCollectionNode} from './Collection';
import {ContextValue, forwardRefType, SlotProps, StyleProps, useContextProps} from './utils';
import {filterDOMProps} from '@react-aria/utils';
import {Key} from '@react-types/shared';
import {LinkContext} from './Link';
import React, {createContext, ForwardedRef, forwardRef, JSX, ReactNode, RefObject} from 'react';

export interface BreadcrumbsProps<T> extends Omit<CollectionProps<T>, 'disabledKeys'>, AriaBreadcrumbsProps, StyleProps, SlotProps {
  /** Whether the breadcrumbs are disabled. */
  isDisabled?: boolean,
  /** Handler that is called when a breadcrumb is clicked. */
  onAction?: (key: Key) => void
}

export const BreadcrumbsContext = createContext<ContextValue<BreadcrumbsProps<any>, HTMLOListElement>>(null);

function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>, ref: ForwardedRef<HTMLOListElement>) {
  [props, ref] = useContextProps(props, ref, BreadcrumbsContext);
  let {portal, collection} = useCollection(props);

  // Render the portal first so that we have the collection by the time we render the DOM in SSR
  return (
    <>
      {portal}
      <BreadcrumbsInner props={props} collection={collection} breadcrumbsRef={ref} />
    </>
  );
}

interface BreadcrumbsInnerProps<T> {
  props: BreadcrumbsProps<T>,
  collection: Collection<Node<T>>,
  breadcrumbsRef: RefObject<HTMLOListElement>
}

function BreadcrumbsInner<T extends object>({props, collection, breadcrumbsRef: ref}: BreadcrumbsInnerProps<T>) {
  return (
    <ol
      ref={ref}
      {...filterDOMProps(props, {labelable: true})}
      slot={props.slot || undefined}
      style={props.style}
      className={props.className ?? 'react-aria-Breadcrumbs'}>
      {[...collection].map((node, i) => (
        <BreadcrumbItem
          key={node.key}
          node={node}
          isCurrent={i === collection.size - 1}
          isDisabled={props.isDisabled}
          onAction={props.onAction} />
      ))}
    </ol>
  );
}

/**
 * Breadcrumbs display a hierarchy of links to the current page or resource in an application.
 */
const _Breadcrumbs = /*#__PURE__*/ (forwardRef as forwardRefType)(Breadcrumbs);
export {_Breadcrumbs as Breadcrumbs};

export interface BreadcrumbProps extends StyleProps {
  /** A unique id for the breadcrumb, which will be passed to `onAction` when the breadcrumb is pressed. */
  id?: Key,
  /** The children of the breadcrumb, typically a `<Link>`. */
  children: ReactNode
}

function Breadcrumb(props: BreadcrumbProps, ref: ForwardedRef<HTMLLIElement>): JSX.Element | null {
  return useSSRCollectionNode('item', props, ref, props.children);
}

/**
 * A Breadcrumb represents an individual item in a `<Breadcrumbs>` list.
 */
const _Breadcrumb = /*#__PURE__*/ (forwardRef as forwardRefType)(Breadcrumb);
export {_Breadcrumb as Breadcrumb};

interface BreadcrumbItemProps {
  node: Node<object>,
  isCurrent: boolean,
  isDisabled?: boolean,
  onAction?: (key: Key) => void
}

function BreadcrumbItem({node, isCurrent, isDisabled, onAction}: BreadcrumbItemProps) {
  // Recreating useBreadcrumbItem because we want to use composition instead of having the link builtin.
  let linkProps = {
    'aria-current': isCurrent ? 'page' : null,
    isDisabled: isDisabled || isCurrent,
    onPress: () => onAction?.(node.key)
  };

  return (
    <li
      {...filterDOMProps(node.props)}
      ref={node.props.ref}
      style={node.props.style}
      className={node.props.className ?? 'react-aria-Breadcrumb'}>
      <LinkContext.Provider value={linkProps}>
        {node.rendered}
      </LinkContext.Provider>
    </li>
  );
}
