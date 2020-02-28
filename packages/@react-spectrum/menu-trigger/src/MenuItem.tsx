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

import CheckmarkMedium from '@spectrum-icons/ui/CheckmarkMedium';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {Grid} from '@react-spectrum/layout';
import React, {useRef} from 'react';
import {SpectrumMenuItemProps} from '@react-types/menu';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {Text} from '@react-spectrum/typography';
import {useMenuContext} from './context';
import {useMenuItem} from '@react-aria/menu-trigger';

export function MenuItem<T>(props: SpectrumMenuItemProps<T>) {
  let {
    item,
    state,
    ...otherProps
  } = props;

  let menuProps = useMenuContext();

  let {
    onClose,
    closeOnSelect
  } = menuProps;

  let {
    rendered,
    isSelected,
    isDisabled,
    key
  } = item;

  let ref = useRef<HTMLDivElement>();
  let {menuItemProps} = useMenuItem(
    {
      isSelected,
      isDisabled,
      key,
      ...otherProps
    }, 
    ref, 
    state,
    onClose,
    closeOnSelect
  );

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        {...filterDOMProps(otherProps)}
        {...menuItemProps}
        ref={ref}
        className={classNames(
          styles,
          'spectrum-Menu-item',
          {
            'is-disabled': isDisabled,
            'is-selected': isSelected
          }
        )}>
        <Grid
          UNSAFE_className={
            classNames(
              styles,
              'spectrum-Menu-itemGrid'
            )
          }  
          slots={{
            text: styles['spectrum-Menu-itemLabel'],
            end: styles['spectrum-Menu-end'],
            icon: styles['spectrum-Menu-icon'],
            description: styles['spectrum-Menu-description'],
            keyboard: styles['spectrum-Menu-keyboard']}}>
          {!Array.isArray(rendered) && (
            <Text>
              {rendered}
            </Text>
          )}
          {Array.isArray(rendered) && rendered}
          {isSelected && 
            <CheckmarkMedium 
              slot="end" 
              UNSAFE_className={
                classNames(
                  styles, 
                  'spectrum-Menu-checkmark'
                )
              } />
          }
        </Grid>  
      </div>
    </FocusRing>
  );
}
