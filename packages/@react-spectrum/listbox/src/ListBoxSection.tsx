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
import {layoutInfoToStyle, useCollectionItem} from '@react-aria/collections';
import {ListState} from '@react-stately/list';
import {Node} from '@react-stately/collections';
import React, {Fragment, ReactNode, useRef} from 'react';
import {ReusableView} from '@react-stately/collections';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {useListBoxSection} from '@react-aria/listbox';
import {useSeparator} from '@react-aria/separator';

interface ListBoxSectionProps<T> {
  reusableView: ReusableView<Node<T>, unknown>,
  header: ReusableView<Node<T>, unknown>,
  state: ListState<T>,
  children?: ReactNode
}

export function ListBoxSection<T>(props: ListBoxSectionProps<T>) {
  let {state, children, reusableView, header} = props;
  let item = reusableView.content;
  let {headingProps, groupProps} = useListBoxSection();
  let {separatorProps} = useSeparator({
    elementType: 'li'
  });

  let headerRef = useRef();
  useCollectionItem({
    reusableView: header,
    ref: headerRef
  });

  return (
    <Fragment>
      <div role="presentation" ref={headerRef} style={layoutInfoToStyle(header.layoutInfo)}>
        {item.key !== state.collection.getFirstKey() &&
          <div
            {...separatorProps}
            className={classNames(
              styles,
              'spectrum-Menu-divider'
            )} />
        }
        {item.rendered &&
          <div
            {...headingProps}
            className={
              classNames(
                styles,
                'spectrum-Menu-sectionHeading'
              )
            }>
            {item.rendered}
          </div>
        }
      </div>
      <div
        {...groupProps}
        style={layoutInfoToStyle(reusableView.layoutInfo)}
        className={
          classNames(
            styles, 
            'spectrum-Menu'
          )
        }>
        {children}
      </div>
    </Fragment>
  );
}
