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
import {Collection, CollectionBuilder, CollectionNode, createLeafComponent} from '@react-aria/collections';
import {CollectionProps, CollectionRendererContext} from './Collection';
import {ContextValue, RenderProps, SlotProps, StyleProps, useContextProps, useRenderProps, useSlottedContext} from './utils';
import {filterDOMProps, mergeProps} from '@react-aria/utils';
import {forwardRefType, GlobalDOMAttributes, Key} from '@react-types/shared';
import {LinkContext} from './Link';
import {Node} from 'react-stately';
import React, {createContext, ForwardedRef, forwardRef, useContext} from 'react';

export interface BreadcrumbsProps<T> extends Omit<CollectionProps<T>, 'disabledKeys'>, AriaBreadcrumbsProps, StyleProps, SlotProps, GlobalDOMAttributes<HTMLOListElement> {
  /** Whether the breadcrumbs are disabled. */
  isDisabled?: boolean,
  /** Handler that is called when a breadcrumb is clicked. */
  onAction?: (key: Key) => void
}

export const BreadcrumbsContext = createContext<ContextValue<BreadcrumbsProps<any>, HTMLOListElement>>(null);

/**
 * Breadcrumbs display a hierarchy of links to the current page or resource in an application.
 */
export const Breadcrumbs = /*#__PURE__*/ (forwardRef as forwardRefType)(function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>, ref: ForwardedRef<HTMLOListElement>) {
  [props, ref] = useContextProps(props, ref, BreadcrumbsContext);
  let {CollectionRoot} = useContext(CollectionRendererContext);
  let {navProps} = useBreadcrumbs(props);
  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <CollectionBuilder content={<Collection {...props} />}>
      {collection => (
        <ol
          ref={ref}
          {...mergeProps(DOMProps, navProps)}
          slot={props.slot || undefined}
          style={props.style}
          className={props.className ?? 'react-aria-Breadcrumbs'}>
          <BreadcrumbsContext.Provider value={props}>
            <CollectionRoot collection={collection} />
          </BreadcrumbsContext.Provider>
        </ol>
      )}
    </CollectionBuilder>
  );
});

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

export interface BreadcrumbProps extends RenderProps<BreadcrumbRenderProps>, GlobalDOMAttributes<HTMLLIElement>  {
  /** A unique id for the breadcrumb, which will be passed to `onAction` when the breadcrumb is pressed. */
  id?: Key
}

class BreadcrumbNode extends CollectionNode<unknown> {
  static readonly type = 'item';
}

/**
 * A Breadcrumb represents an individual item in a `<Breadcrumbs>` list.
 */
export const Breadcrumb = /*#__PURE__*/ createLeafComponent(BreadcrumbNode, function Breadcrumb(props: BreadcrumbProps, ref: ForwardedRef<HTMLLIElement>, node: Node<unknown>) {
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

  let DOMProps = filterDOMProps(props as any, {global: true});
  delete DOMProps.id;

  return (
    <li
      {...DOMProps}
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
