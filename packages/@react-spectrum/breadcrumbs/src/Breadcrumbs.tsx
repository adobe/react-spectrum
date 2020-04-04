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

import {ActionButton} from '@react-spectrum/button';
import {BreadcrumbItem} from './BreadcrumbItem';
import {classNames, filterDOMProps, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import FolderBreadcrumb from '@spectrum-icons/ui/FolderBreadcrumb';
import {Menu, MenuTrigger} from '@react-spectrum/menu';
import React, {Key, useEffect, useRef, useState} from 'react';
import {SpectrumBreadcrumbsProps} from '@react-types/breadcrumbs';
import styles from '@adobe/spectrum-css-temp/components/breadcrumb/vars.css';
import {useBreadcrumbs} from '@react-aria/breadcrumbs';
import {useProviderProps} from '@react-spectrum/provider';

// This value doesn't include the "menu", or the root if showRoot = true. The reason we ignore the menu and root is
// because we always want to make sure we show the current breadcrumb.
const MIN_VISIBLE_ITEMS = 1;

// When dealing with the maximum number of items, we consider the root an item if showRoot = true (which is different
// to the minimum). This means you'll see the root, the menu, and 4 other items when showRoot = true. When the root is
// not showing, you'll see the menu and 5 other items.
const MAX_VISIBLE_ITEMS = 5;

function Breadcrumbs<T>(props: SpectrumBreadcrumbsProps<T>, ref: DOMRef) {
  props = useProviderProps(props);
  let {
    size = 'M',
    children,
    isHeading,
    headingAriaLevel,
    showRoot,
    isDisabled,
    maxVisibleItems = MAX_VISIBLE_ITEMS,
    onAction,
    ...otherProps
  } = props;

  let childArray = React.Children.toArray(children);
  let isCollapsible = maxVisibleItems === 'auto';

  let domRef = useDOMRef(ref);
  let listRef = useRef(null);

  let defaultVisibleItems: number;

  if (isCollapsible) {
    defaultVisibleItems = childArray.length;
  } else {
    defaultVisibleItems = showRoot ? maxVisibleItems as number - 1 : maxVisibleItems as number;
  }

  const [visibleItems, setVisibleItems] = useState(defaultVisibleItems);

  let {breadcrumbsProps} = useBreadcrumbs(props);
  let {styleProps} = useStyleProps(otherProps);

  useEffect(() => {
    // Only run the resize logic if the menu is collapsible to avoid the risk of performance problems.
    if (isCollapsible && listRef.current) {
      let listItems = [...listRef.current.children];
      // Ignore the last item when the size is large because it wraps onto a new line and doesn't take up horizontal space.
      let listItemsToMeasure = size === 'L' ? listItems.slice(0, listItems.length - 1) : listItems;
      let childrenWidths = listItemsToMeasure.map((item) => item.getBoundingClientRect().width);

      let onResize = () => {
        let containerWidth = listRef.current.getBoundingClientRect().width;
        let [rootBreadcrumbWidth, ...otherBreadcrumbWidths] = childrenWidths;
        let calculatedWidth = 0;

        // Make sure we account for the root breadcrumb if it's enabled.
        if (showRoot) {
          calculatedWidth += rootBreadcrumbWidth;
        }

        let otherVisibleItemsCount = 0;

        // See how many other breadcrumbs we can fit (starting from the right).
        otherBreadcrumbWidths.reverse().forEach(breadcrumbWidth => {
          calculatedWidth += breadcrumbWidth;
          if (calculatedWidth < containerWidth) {
            otherVisibleItemsCount++;
          }
        });

        let minVisibleItems = showRoot ? MIN_VISIBLE_ITEMS + 1 : MIN_VISIBLE_ITEMS;

        if (otherVisibleItemsCount < minVisibleItems) {
          otherVisibleItemsCount = MIN_VISIBLE_ITEMS;
        }

        let maxVisibleOtherItems = showRoot ? MAX_VISIBLE_ITEMS - 1 : MAX_VISIBLE_ITEMS;

        if (isCollapsible && otherVisibleItemsCount > maxVisibleOtherItems) {
          otherVisibleItemsCount = maxVisibleOtherItems;
        }

        setVisibleItems(otherVisibleItemsCount);
      };

      window.addEventListener('resize', onResize);
      onResize();
      return () => {
        window.removeEventListener('resize', onResize);
      };
    }
  }, [isCollapsible, childArray.length, listRef, showRoot, size]);

  if (childArray.length > visibleItems) {
    let selectedItem = childArray[childArray.length - 1];
    let selectedKey = selectedItem.props.uniqueKey || selectedItem.key;
    let onMenuAction = (key: Key) => {
      // Don't fire onAction when clicking on the last item
      if (key !== selectedKey) {
        onAction(key);
      }
    };

    let menuItem = (
      <BreadcrumbItem key="menu">
        <MenuTrigger>
          <ActionButton
            aria-label="…"
            isQuiet
            isDisabled={isDisabled}>
            <FolderBreadcrumb />
          </ActionButton>
          <Menu selectionMode="single" selectedKeys={[selectedKey]} onAction={onMenuAction}>
            {childArray}
          </Menu>
        </MenuTrigger>
      </BreadcrumbItem>
    );

    let [rootBreadcrumb, ...otherBreadcrumbs] = childArray;
    let rootItems = showRoot ? [rootBreadcrumb, menuItem] : [menuItem];
    let visibleBreadcrumbs = otherBreadcrumbs.slice(-visibleItems);

    childArray = [
      ...rootItems,
      ...visibleBreadcrumbs
    ];
  }

  let lastIndex = childArray.length - 1;
  let breadcrumbItems = childArray.map((child, index) => {
    let isCurrent = index === lastIndex;
    let key = child.props.uniqueKey || child.key;
    let onPress = () => {
      if (onAction) {
        onAction(key);
      }
    };

    return (
      <li
        key={key}
        className={
          classNames(
            styles,
            'spectrum-Breadcrumbs-item'
          )
        }>
        <BreadcrumbItem
          isCurrent={isCurrent}
          isHeading={isCurrent && isHeading}
          headingAriaLevel={headingAriaLevel}
          isDisabled={isDisabled}
          onPress={onPress}>
          {child.props.children}
        </BreadcrumbItem>
      </li>
    );
  });

  return (
    <nav
      {...filterDOMProps(otherProps)}
      {...styleProps}
      {...breadcrumbsProps}
      className={classNames({}, styleProps.className)}
      ref={domRef}>
      <ul
        ref={listRef}
        className={
          classNames(
            styles,
            'spectrum-Breadcrumbs',
            {
              'spectrum-Breadcrumbs--compact': size === 'S',
              'spectrum-Breadcrumbs--multiline': size === 'L',
              'is-disabled': isDisabled
            },
            styleProps.className
          )
        }>
        {breadcrumbItems}
      </ul>
    </nav>
  );
}

let _Breadcrumbs = React.forwardRef(Breadcrumbs);
export {_Breadcrumbs as Breadcrumbs};
