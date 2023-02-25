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

import {classNames} from '@react-spectrum/utils';
import {layoutInfoToStyle, useVirtualizerItem} from '@react-aria/virtualizer';
import listStyles from './styles.css';
import {ListViewContext} from './ListView';
import {Node} from '@react-types/shared';
import React, {ReactNode, useContext, useRef} from 'react';
import {ReusableView} from '@react-stately/virtualizer';
import {useGridListSection} from '@react-aria/gridlist';
import {useLocale} from '@react-aria/i18n';

interface ListViewSectionProps<T> {
  reusableView: ReusableView<Node<T>, unknown>,
  header: ReusableView<Node<T>, unknown>,
  children?: ReactNode
}

export function ListViewSection<T>(props: ListViewSectionProps<T>) {
  let {children, reusableView: sectionView, header} = props;
  let {state} = useContext(ListViewContext);
  let {direction} = useLocale();
  let item = sectionView.content;
  let {gridSectionProps, gridRowProps, gridRowHeaderProps} = useGridListSection({node: item, isVirtualized: true}, state);
  let headerRowRef = useRef();

  useVirtualizerItem({
    reusableView: header,
    ref: headerRowRef
  });

  // TODO: try to make the section add its 16px padding to its bottom. Will need to do something with useVirtualizerItem though
  // since we need to adjust the layout height after measuring the space that the rows take within

  return (
    <>
      <div
        {...gridSectionProps}
        style={layoutInfoToStyle(sectionView.layoutInfo, direction)}
        className={
          classNames(
            listStyles,
            'react-spectrum-ListViewSection',
            {
              'react-spectrum-ListViewSection--firstRow': item.index === 0
            }
          )
        }>
        <div
          role="presentation"
          ref={headerRowRef}
          style={layoutInfoToStyle(header.layoutInfo, direction, sectionView.layoutInfo)}>
          <div
            {...gridRowProps}
            className={
              classNames(
                listStyles,
                'react-spectrum-ListViewSection-header'
              )
            }>
            <span {...gridRowHeaderProps}>
              {item.rendered}
            </span>
          </div>
        </div>
        {children}
      </div>
    </>
  );
}
