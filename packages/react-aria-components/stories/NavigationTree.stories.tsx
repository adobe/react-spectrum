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
  Button,
  Link,
  NavigationTree,
  NavigationTreeItem,
  NavigationTreeItemContent,
  RouterProvider
} from 'react-aria-components';
import {classNames} from '@adobe/react-spectrum/private/utils/classNames';
import React, {ReactNode, useState} from 'react';
import styles from '../example/index.css';

export default {
  title: 'React Aria Components/NavigationTree'
};

function RoutedNavigationTree(props: {
  children: ({selectedRoute}: {selectedRoute: string}) => ReactNode;
  defaultSelectedRoute: string;
}) {
  let {children} = props;
  let [selectedRoute, setSelectedRoute] = useState<string>(props.defaultSelectedRoute);

  let updateSelection = (href: string) => {
    setSelectedRoute(href);
  };

  return <RouterProvider navigate={updateSelection}>{children({selectedRoute})}</RouterProvider>;
}

function Item(props: {href?: string; title: string; children?: ReactNode}) {
  let {href, title, children} = props;
  return (
    <NavigationTreeItem
      id={href}
      href={href}
      textValue={title}
      className={({isCurrent, isFocusVisible, isFocused, isHovered}) =>
        classNames(styles, 'tree-item', {
          focused: isFocused,
          'focus-visible': isFocusVisible,
          hovered: isHovered,
          selected: isCurrent
        })
      }>
      <NavigationTreeItemContent>
        {({isExpanded, hasChildItems}) => (
          <div
            className={classNames(styles, 'content-wrapper')}
            style={{
              marginInlineStart: `calc(var(--tree-item-level) * 15px)`
            }}>
            <Button
              style={{visibility: hasChildItems ? 'visible' : 'hidden', marginInlineEnd: '4px'}}
              slot="chevron"
              aria-label="expand"
              isDisabled={!hasChildItems}>
              <div
                style={{
                  transform: `rotate(${isExpanded ? 90 : 0}deg)`,
                  width: '16px',
                  height: '16px'
                }}>
                ▶
              </div>
            </Button>
            {href != null ? (
              <Link style={{color: 'inherit', textDecoration: 'none', outline: 'none'}}>
                {title}
              </Link>
            ) : (
              <span>{title}</span>
            )}
            <Button>Other</Button>
          </div>
        )}
      </NavigationTreeItemContent>
      {children}
    </NavigationTreeItem>
  );
}

export const Example = (args: any) => (
  <RoutedNavigationTree defaultSelectedRoute="/files">
    {({selectedRoute}) => (
      <NavigationTree
        aria-label="Example"
        selectedRoute={selectedRoute}
        className={styles.tree}
        {...args}>
        <Item href="/files" title="Your files" />
        <Item title="Your libraries">
          <Item href="/projects-1" title="Projects 1" />
          <Item href="/projects-2" title="Projects 2" />
        </Item>
        <Item href="/shared" title="Shared with you">
          <Item href="/projects-3" title="Projects 3" />
          <Item href="/projects-4" title="Projects 4" />
        </Item>
      </NavigationTree>
    )}
  </RoutedNavigationTree>
);
