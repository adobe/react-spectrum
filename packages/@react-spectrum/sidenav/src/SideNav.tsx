/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {classNames, filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {CollectionBase, Expandable, MultipleSelection, StyleProps} from '@react-types/shared';
import {CollectionView} from '@react-aria/collections';
import {FocusRing} from '@react-aria/focus';
import {ListLayout, Node} from '@react-stately/collections';
import React, {AllHTMLAttributes, useMemo, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';
import {TreeState, useTreeState} from '@react-stately/tree';
import {useSideNav, useSideNavItem} from '@react-aria/sidenav';

export interface SideNavProps<T> extends CollectionBase<T>, MultipleSelection, Expandable, StyleProps {}

export function SideNav<T>(props: SideNavProps<T>) {
  let state = useTreeState({...props, selectionMode: 'single'});

  let layout = useMemo(() => new ListLayout({rowHeight: 40}), []);

  let {navProps, listProps} = useSideNav(props, state, layout);

  let {styleProps} = useStyleProps(props);

  return (
    <nav
      {...filterDOMProps(props)}
      {...navProps}
      {...styleProps} >
      <CollectionView
        {...listProps}
        focusedKey={state.selectionManager.focusedKey}
        className={classNames(styles, 'spectrum-SideNav')}
        layout={layout}
        collection={state.tree}>
        {(type, item) => {
          if (type === 'section') {
            return (
              <SideNavHeading
                item={item} />
            );
          }

          return (
            <SideNavItem
              state={state}
              item={item} />
          );
        }}
      </CollectionView>
    </nav>
  );
}

interface SideNavItemProps<T> extends AllHTMLAttributes<HTMLElement>{
  item: Node<T>,
  state: TreeState<T>
}

function SideNavItem<T>(props: SideNavItemProps<T>) {
  let ref = useRef<HTMLAnchorElement>();
  let {
    isSelected,
    isDisabled,
    rendered
  } = props.item;

  let className = classNames(
    styles,
    'spectrum-SideNav-item',
    {
      'is-selected': isSelected,
      'is-disabled': isDisabled
    }
  );

  let {listItemProps, listItemLinkProps} = useSideNavItem(props, props.state, ref);

  return (
    <div
      {...listItemProps}
      className={className} >
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
        <a
          {...listItemLinkProps}
          ref={ref}
          className={classNames(styles, 'spectrum-SideNav-itemLink')} >
          {rendered}
        </a>
      </FocusRing>
    </div>
  );
}

interface SideNavHeadingProps<T> extends AllHTMLAttributes<HTMLElement> {
  item: Node<T>
}

function SideNavHeading<T>({item, ...otherProps}: SideNavHeadingProps<T>) {

  return (
    <h2
      {...otherProps}
      className={classNames(styles, 'spectrum-SideNav-heading')} >
      {item.rendered}
    </h2>
  );
}
