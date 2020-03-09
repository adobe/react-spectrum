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

import {classNames} from '@react-spectrum/utils';
import {ListState} from '@react-stately/list';
import {Node} from '@react-stately/collections';
import React, {Fragment, ReactNode} from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {useListBoxSection} from '@react-aria/listbox';
import {useSeparator} from '@react-aria/separator';

interface ListBoxSectionProps<T> {
  item: Node<T>,
  state: ListState<T>,
  children?: ReactNode
}

export function ListBoxSection<T>(props: ListBoxSectionProps<T>) {
  let {item, state, children} = props;
  let {itemProps, headingProps, groupProps} = useListBoxSection();
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
          {children}
        </ul>
      </li>
    </Fragment>
  );
}
