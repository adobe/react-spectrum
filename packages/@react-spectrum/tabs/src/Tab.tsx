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

import {classNames, filterDOMProps, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import {DOMProps, StyleProps} from '@react-types/shared';
import React, {ReactNode} from 'react';
import styles from '@adobe/spectrum-css-temp/components/tabs/vars.css';
import {useTab} from '@react-aria/tabs';

interface TabProps extends DOMProps, StyleProps {
  icon?: ReactNode,
  label?: ReactNode,
  value: any,
  children?: ReactNode,
  isDisabled?: boolean,
  isSelected?: boolean, // Had to add this, TS complains in TabList in renderTabs
  onSelect?: () => void  // Override React.HTMLAttributes onSelect
}

export function Tab(props: TabProps) {
  props = useSlotProps(props);
  // v3 come up with rule for how to handle props and dom props issue
  // v3 Always use classNames even when only one class because of modules and "turnonclassname" option
  // TODO: Add in icon in the render when cloneIcon/icon v3 becomes available. Make it so icon or label must be defined.
  let {label, isDisabled, ...otherProps} = props;
  let {styleProps} = useStyleProps(otherProps);
  let {tabProps} = useTab(props);
  return (
    <div
      {...filterDOMProps(otherProps)}
      {...styleProps}
      {...tabProps}
      className={classNames(
        styles,
        'spectrum-Tabs-item',
        {
          'is-selected': tabProps['aria-selected'],
          'is-disabled': isDisabled
        },
        styleProps.className
      )}>
      {label && <span className={classNames(styles, 'spectrum-Tabs-itemLabel')}>{label}</span>}
    </div>
  );

}
