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
import {classNames} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {Grid} from '@react-spectrum/layout';
import {Node} from '@react-stately/collections';
import React, {useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {Text} from '@react-spectrum/typography';
import {TreeState} from '@react-stately/tree';
import {useMenuContext} from './context';
import {useMenuItem} from '@react-aria/menu';

interface MenuItemProps<T> {
  item: Node<T>,
  state: TreeState<T>,
  isVirtualized?: boolean,
}

export function MenuItem<T>(props: MenuItemProps<T>) {
  let {
    item,
    state,
    isVirtualized
  } = props;

  let {
    onClose,
    closeOnSelect
  } = useMenuContext();

  let {
    rendered,
    isSelected,
    isDisabled,
    key
  } = item;

  let ref = useRef<HTMLLIElement>();
  let {menuItemProps, labelProps, descriptionProps, keyboardShortcutProps} = useMenuItem(
    {
      isSelected,
      isDisabled,
      key,
      onClose,
      closeOnSelect,
      ref,
      isVirtualized
    }, 
    state
  );

  let contents = typeof rendered === 'string'
    ? <Text>{rendered}</Text>
    : rendered;

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <li
        {...menuItemProps}
        ref={ref}
        className={classNames(
          styles,
          'spectrum-Menu-item',
          {
            'is-disabled': isDisabled,
            'is-selected': isSelected,
            'is-selectable': state.selectionManager.selectionMode !== 'none'
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
            text: {UNSAFE_className: styles['spectrum-Menu-itemLabel'], ...labelProps},
            end: {UNSAFE_className: styles['spectrum-Menu-end'], ...descriptionProps},
            icon: {UNSAFE_className: styles['spectrum-Menu-icon']},
            description: {UNSAFE_className: styles['spectrum-Menu-description'], ...descriptionProps},
            keyboard: {UNSAFE_className: styles['spectrum-Menu-keyboard'], ...keyboardShortcutProps}
          }}>
          {contents}
          {isSelected && 
            <CheckmarkMedium 
              slot="checkmark" 
              UNSAFE_className={
                classNames(
                  styles, 
                  'spectrum-Menu-checkmark'
                )
              } />
          }
        </Grid>
      </li>
    </FocusRing>
  );
}
