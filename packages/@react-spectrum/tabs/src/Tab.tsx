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
import {FocusRing} from '@react-aria/focus';
import React, {useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/tabs/vars.css';
import {TabProps} from '@react-types/tabs';
import {useTab} from '@react-aria/tabs';

export function Tab<T>(props: TabProps<T>) {
  let {item, state, ...otherProps} = props;
  let {styleProps} = useStyleProps(otherProps);
  let {
    key,
    rendered
  } = item;
  let ref = useRef<any>();
  let {tabProps} = useTab({
    item,
    ref
  }, state);

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
