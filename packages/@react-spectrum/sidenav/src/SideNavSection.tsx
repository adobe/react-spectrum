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
import React, {Fragment, useRef} from 'react';
import {SideNavSectionProps} from '@react-types/sidenav';
import styles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';
import {useListBoxSection} from '@react-aria/listbox';

export function SideNavSection<T>(props: SideNavSectionProps<T>) {
  let {children, reusableView, header} = props;
  let item = reusableView.content;
  let {headingProps, groupProps} = useListBoxSection({
    heading: item.rendered,
    'aria-label': item['aria-label']
  });

  let headerRef = useRef();
  useCollectionItem({
    reusableView: header,
    ref: headerRef
  });

  return (
    <Fragment>
      <div role="presentation" ref={headerRef} style={layoutInfoToStyle(header.layoutInfo)}>
        {item.rendered &&
          <div
            {...headingProps}
            className={
              classNames(
                styles,
                'spectrum-SideNav-heading'
              )
            }>
            {item.rendered}
          </div>
        }
      </div>
      <div
        {...groupProps}
        style={layoutInfoToStyle(reusableView.layoutInfo)}>
        {children}
      </div>
    </Fragment>
  );
}
