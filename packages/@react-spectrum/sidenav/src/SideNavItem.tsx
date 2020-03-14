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
import {FocusRing} from '@react-aria/focus';
import React, {useRef} from 'react';
import {SpectrumSideNavItemProps} from '@react-types/sidenav';
import styles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';
import {useSideNavItem} from '@react-aria/sidenav';

export function SideNavItem<T>(props: SpectrumSideNavItemProps<T>) {
  let ref = useRef<HTMLAnchorElement>();
  let {
    isSelected,
    isDisabled,
    rendered
  } = props.item;

  let className = classNames(
    styles,
    'spectrum-SideNav-item',
    {
      'is-selected': isSelected,
      'is-disabled': isDisabled
    }
  );

  let {listItemProps, listItemLinkProps} = useSideNavItem(props, props.state, ref);

  return (
    <div
      {...listItemProps}
      className={className} >
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
        <a
          {...listItemLinkProps}
          ref={ref}
          className={classNames(styles, 'spectrum-SideNav-itemLink')} >
          {rendered}
        </a>
      </FocusRing>
    </div>
  );
}
