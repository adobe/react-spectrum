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
import {AriaBreadcrumbsProps, useBreadcrumbs} from 'react-aria';
import {Collection, Node} from 'react-stately';
import {CollectionProps, useCollection} from './Collection';
import {ContextValue, forwardRefType, Provider, SlotProps, StyleProps, useContextProps} from './utils';
import {filterDOMProps} from '@react-aria/utils';
import {HeadingContext} from './Heading';
import {LinkContext} from './Link';
import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes, Key, RefObject} from 'react';

export interface BreadcrumbsProps<T> extends Omit<CollectionProps<T>, 'disabledKeys'>, Omit<AriaBreadcrumbsProps, 'children'>, StyleProps, SlotProps {
  /** Whether the breadcrumbs are disabled. */
  isDisabled?: boolean,
  /** Handler that is called when a breadcrumb is clicked. */
  onAction?: (key: Key) => void
}

export const BreadcrumbsContext = createContext<ContextValue<BreadcrumbsProps<any>, HTMLElement>>(null);

function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>, ref: ForwardedRef<HTMLElement>) {
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
  breadcrumbsRef: RefObject<HTMLElement>
}

function BreadcrumbsInner<T extends object>({props, collection, breadcrumbsRef: ref}: BreadcrumbsInnerProps<T>) {
  let {navProps} = useBreadcrumbs(props);

  return (
    <nav
      ref={ref}
      {...filterDOMProps(props)}
      {...navProps}
      slot={props.slot}
      style={props.style}
      className={props.className ?? 'react-aria-Breadcrumbs'}>
      {/* TODO: cannot style this element directly */}
      <ol>
        {[...collection].map((node, i) => (
          <BreadcrumbItem
            key={node.key}
            node={node}
            isCurrent={i === collection.size - 1}
            isDisabled={props.isDisabled}
            onAction={props.onAction} />
        ))}
      </ol>
    </nav>
  );
}

/**
 * Breadcrumbs display a heirarchy of links to the current page or resource in an application.
 */
const _Breadcrumbs = /*#__PURE__*/ (forwardRef as forwardRefType)(Breadcrumbs);
export {_Breadcrumbs as Breadcrumbs};

interface BreadcrumbItemProps {
  node: Node<object>,
  isCurrent: boolean,
  isDisabled?: boolean,
  onAction?: (key: Key) => void
}

function BreadcrumbItem({node, isCurrent, isDisabled, onAction}: BreadcrumbItemProps) {
  // Recreating useBreadcrumbItem because we want to use composition instead of having the link builtin.
  let headingProps: HTMLAttributes<HTMLHeadingElement> | null = isCurrent ? {'aria-current': 'page'} : null;
  let linkProps = {
    'aria-current': isCurrent ? 'page' : null,
    isDisabled: isDisabled || isCurrent,
    onPress: () => onAction?.(node.key)
  };

  return (
    <li
      {...filterDOMProps(node.props)}
      style={node.props.style}
      className={node.props.className ?? 'react-aria-Item'}>
      <Provider
        values={[
          [LinkContext, linkProps],
          [HeadingContext, headingProps]
        ]}>
        {node.rendered}
      </Provider>
    </li>
  );
}
