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

import {classNames, useStyleProps} from '@react-spectrum/utils';
import {DOMProps, Node, StyleProps} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
import {ListState} from '@react-stately/list';
import React, {ReactNode, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/tabs/vars.css';
import {useTab} from '@react-aria/tabs';

interface TabProps<T> extends DOMProps, StyleProps {
  item: Node<T>,
  state: ListState<T>,
  title?: ReactNode,
  children?: ReactNode,
  isDisabled?: boolean,
  isSelected?: boolean,
  onSelect?: () => void
}

export function Tab<T>(props: TabProps<T>) {
  // v3 come up with rule for how to handle props and dom props issue
  // v3 Always use classNames even when only one class because of modules and "turnonclassname" option
  // TODO: Add in icon in the render when cloneIcon/icon v3 becomes available. Make it so icon or label must be defined.
  let {item, state, ...otherProps} = props;
  let {styleProps} = useStyleProps(otherProps);
  let ref = useRef<any>();
  let {tabProps} = useTab({
    item,
    ref
  }, state);
  let {
    key,
    rendered
  } = item;

  let isSelected = state.selectionManager.selectedKeys.has(key);
  let isDisabled = state.disabledKeys.has(key);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        {...styleProps}
        {...tabProps}
        ref={ref}
        className={classNames(
          styles,
          'spectrum-Tabs-item',
          {
            'is-selected': isSelected,
            'is-disabled': isDisabled
          },
          styleProps.className
        )}>
        {rendered && <span className={classNames(styles, 'spectrum-Tabs-itemLabel')}>{rendered}</span>}
      </div>
    </FocusRing>
  );

}
