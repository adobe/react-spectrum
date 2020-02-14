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
import {BreadcrumbItem} from './';
import {classNames, filterDOMProps, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {DOMProps, DOMRef} from '@react-types/shared';
import FolderBreadcrumb from '@spectrum-icons/ui/FolderBreadcrumb';
import React, {useEffect, useRef, useState} from 'react';
import {SpectrumBreadcrumbsProps} from '@react-types/breadcrumbs';
import styles from '@adobe/spectrum-css-temp/components/breadcrumb/vars.css';
import {useBreadcrumbs} from '@react-aria/breadcrumbs';
import {useProviderProps} from '@react-spectrum/provider';

const MIN_VISIBLE_ITEMS = 2;
const MAX_VISIBLE_ITEMS = 4;

function Breadcrumbs(props: SpectrumBreadcrumbsProps, ref: DOMRef) {
  props = useProviderProps(props);
  let {
    size = 'M',
    children,
    isHeading,
    headingAriaLevel,
    showRoot,
    isDisabled,
    maxVisibleItems = MAX_VISIBLE_ITEMS,
    ...otherProps
  } = props;

  let childArray = React.Children.toArray(children);
  let isCollapsible = maxVisibleItems === 'auto';

  let domRef = useDOMRef(ref);
  let listRef = useRef(null);

  const [visibleItems, setVisibleItems] = useState(isCollapsible ? childArray.length : maxVisibleItems);
  
  let {breadcrumbProps} = useBreadcrumbs(props);
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

    // TODO: replace with menu component
    let menuItem = (
      <BreadcrumbItem key="menu">
        <Menu isDisabled={isDisabled}>{childArray}</Menu>
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
    return (
      <li
        key={child.key}
        className={
          classNames(
            styles,
            'spectrum-Breadcrumbs-item'
          )
        }>
        {React.cloneElement(
          child,
          {
            isCurrent,
            isHeading: isCurrent && isHeading,
            headingAriaLevel,
            isDisabled
          }
        )}
      </li>
    );
  });

  // TODO: replace menu with select
  return (
    <nav
      {...filterDOMProps(otherProps)}
      {...styleProps}
      {...breadcrumbProps}
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

// temporary replacement for menu and select component
interface MenuProps extends DOMProps {
  label?: any,
  isDisabled?: boolean,
  children?: any
}

const Menu = React.forwardRef((props: MenuProps) => {
  let {
    children,
    label = '',
    isDisabled
  } = props;

  return (
    <DialogTrigger type="popover">
      <ActionButton
        aria-label="…"
        icon={<FolderBreadcrumb />}
        isDisabled={isDisabled}
        isQuiet>
        {label && React.cloneElement(label, {isCurrent: undefined})}
      </ActionButton>
      <Dialog>
        {children.map((child) => React.cloneElement(child, {isCurrent: undefined}))}
      </Dialog>
    </DialogTrigger>
  );
});
