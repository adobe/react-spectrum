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
import {ListViewContext} from './ListView';
import {Node} from '@react-types/shared';
import React, {Fragment, ReactNode, useContext, useRef} from 'react';
import {ReusableView} from '@react-stately/virtualizer';
// TODO: replace with styles specific to ListView
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
// TODO: replace with hook for ListView section (provided the props/attributes are actually different)
import {useListBoxSection} from '@react-aria/listbox';
import {useLocale} from '@react-aria/i18n';
import {useSeparator} from '@react-aria/separator';

// TODO: think about what this needs for ListView
// might just be the same
interface ListViewSectionProps<T> {
  reusableView: ReusableView<Node<T>, unknown>,
  header: ReusableView<Node<T>, unknown>,
  children?: ReactNode
}

/** @private */
export function ListViewSection<T>(props: ListViewSectionProps<T>) {
  let {children, reusableView, header} = props;
  let item = reusableView.content;
  // TODO replace with ListView equivalent, will need to see what exactly we need
  let {headingProps, groupProps} = useListBoxSection({
    heading: item.rendered,
    'aria-label': item['aria-label']
  });

  let {separatorProps} = useSeparator({
    elementType: 'li'
  });

  let headerRef = useRef();
  useVirtualizerItem({
    reusableView: header,
    ref: headerRef
  });

  let {direction} = useLocale();
  let {state} = useContext(ListViewContext);

  return (
    <Fragment>
      <div role="presentation" ref={headerRef} style={layoutInfoToStyle(header.layoutInfo, direction)}>
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
        style={layoutInfoToStyle(reusableView.layoutInfo, direction)}
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
