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
  state: ListState<T>,
  shouldSelectOnPressUp?: boolean,
  shouldFocusOnHover?: boolean
}

/** @private */
export function ListBoxOption<T>(props: OptionProps<T>) {
  let {
    item,
    state,
    shouldSelectOnPressUp,
    shouldFocusOnHover
  } = props;

  let {
    rendered,
    isSelected,
    isDisabled,
    key
  } = item;

  let ref = useRef<HTMLDivElement>();
  let {optionProps, labelProps, descriptionProps} = useOption(
    {
      isSelected,
      isDisabled,
      'aria-label': item['aria-label'],
      key,
      ref,
      shouldSelectOnPressUp,
      shouldFocusOnHover,
      isVirtualized: true
    },
    state
  );

  let contents = typeof rendered === 'string'
    ? <Text>{rendered}</Text>
    : rendered;

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        {...optionProps}
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
            icon: {UNSAFE_className: styles['spectrum-Menu-icon']},
            description: {UNSAFE_className: styles['spectrum-Menu-description'], ...descriptionProps}
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
      </div>
    </FocusRing>
  );
}
