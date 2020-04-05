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

const MIN_VISIBLE_ITEMS = 2;
const MAX_VISIBLE_ITEMS = 4;

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

  const [visibleItems, setVisibleItems] = useState(isCollapsible ? childArray.length : maxVisibleItems);

  let {breadcrumbsProps} = useBreadcrumbs(props);
  let {styleProps} = useStyleProps(otherProps);

  useEffect(() => {
    let listItems = [...listRef.current.children];
    let childrenWidthTotals = listItems.reduce((acc, item, index) => (
      [...acc, acc[index] + item.getBoundingClientRect().width]
    ), [0]);

    let onResize = () => {
      if (isCollapsible && listRef.current) {
        let containerWidth = listRef.current.getBoundingClientRect().width;
        let index = childrenWidthTotals.findIndex(totalWidth => totalWidth > containerWidth);

        let visibleItemsCount;
        let minVisibleItems = showRoot ? MIN_VISIBLE_ITEMS + 1 : MIN_VISIBLE_ITEMS;

        if (index ===  -1) {
          visibleItemsCount = childArray.length;
        } else if (index < minVisibleItems) {
          visibleItemsCount = minVisibleItems;
        } else {
          visibleItemsCount = index;
        }

        setVisibleItems(visibleItemsCount);
      }
    };

    window.addEventListener('resize', onResize);
    onResize();
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [isCollapsible, childArray.length, listRef, showRoot]);

  if (childArray.length > visibleItems) {
    let rootItems = showRoot ? [childArray[0]] : [];
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
    rootItems.push(menuItem);

    let restItems = childArray.slice(-visibleItems + rootItems.length);

    childArray = [
      ...rootItems,
      ...restItems
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
