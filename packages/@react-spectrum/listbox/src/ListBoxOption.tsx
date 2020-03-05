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
import {ListState} from '@react-stately/list';
import {Node} from '@react-stately/collections';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {Text} from '@react-spectrum/typography';
import {useOption} from '@react-aria/listbox';
import {useRef} from 'react';

interface OptionProps<T> {
  item: Node<T>,
  state: ListState<T>
}

export function ListBoxOption<T>(props: OptionProps<T>) {
  let {
    item,
    state
  } = props;

  let {
    rendered,
    isSelected,
    isDisabled,
    key
  } = item;

  let ref = useRef<HTMLLIElement>();
  let {optionProps} = useOption(
    {
      isSelected,
      isDisabled,
      key,
      ref,
      isVirtualized: true
    },
    state
  );

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <li
        {...optionProps}
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
            icon: styles['spectrum-Menu-icon'],
            description: styles['spectrum-Menu-description']
          }}>
          {!Array.isArray(rendered) && (
            <Text>
              {rendered}
            </Text>
          )}
          {Array.isArray(rendered) && rendered}
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
