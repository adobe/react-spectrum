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

import { classNames } from '@react-spectrum/utils';
import { MenuItem } from './MenuItem';
import React, { Fragment, ReactNode } from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import { useMenuSection } from '@react-aria/menu';
import { useSeparator } from '@react-aria/separator';
import { Node } from '@react-stately/collections';
import { TreeState } from '@react-stately/tree';

interface MenuSectionProps<T> {
  item: Node<T>,
  state: TreeState<T>
}

export function MenuSection<T>(props: MenuSectionProps<T>) {
  let {item, state} = props;
  let {itemProps, headingProps, groupProps} = useMenuSection();
  let {separatorProps} = useSeparator({
    elementType: 'li'
  });

  return (
    <Fragment>
      {item.key !== state.collection.getFirstKey() &&
        <li
          {...separatorProps}
          className={classNames(
            styles,
            'spectrum-Menu-divider'
          )} />
      }
      <li {...itemProps}>
        {item.rendered &&
          <span
            {...headingProps}
            className={
              classNames(
                styles, 
                'spectrum-Menu-sectionHeading'
              )
            }>
            {item.rendered}
          </span>
        }
        <ul
          {...groupProps}
          className={
            classNames(
              styles, 
              'spectrum-Menu'
            )
          }>
          {[...item.childNodes].map(node => (
            <MenuItem
              item={node}
              state={state} />
          ))}
        </ul>
      </li>
    </Fragment>
  );
}
