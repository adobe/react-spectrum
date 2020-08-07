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
import {classNames, SlotProvider} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {Grid} from '@react-spectrum/layout';
import {ListBoxContext} from './ListBoxContext';
import {mergeProps} from '@react-aria/utils';
import {Node} from '@react-types/shared';
import React, {useContext} from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {Text} from '@react-spectrum/text';
import {useFocusVisible, useHover} from '@react-aria/interactions';
import {useOption} from '@react-aria/listbox';
import {useRef} from 'react';

interface OptionProps<T> {
  item: Node<T>,
  shouldSelectOnPressUp?: boolean,
  shouldFocusOnHover?: boolean,
  shouldUseVirtualFocus?: boolean
}

/** @private */
export function ListBoxOption<T>(props: OptionProps<T>) {
  let {
    item,
    shouldSelectOnPressUp,
    shouldFocusOnHover,
    shouldUseVirtualFocus
  } = props;

  let {
    rendered,
    key
  } = item;

  let state = useContext(ListBoxContext);
  let isSelected = state.selectionManager.isSelected(key);
  let isDisabled = state.disabledKeys.has(key);
  let isFocused = state.selectionManager.focusedKey === key;

  let ref = useRef<HTMLDivElement>();
  let {optionProps, labelProps, descriptionProps} = useOption(
    {
      isSelected,
      isDisabled,
      'aria-label': item['aria-label'],
      key,
      shouldSelectOnPressUp,
      shouldFocusOnHover,
      isVirtualized: true,
      shouldUseVirtualFocus
    },
    state,
    ref
  );
  let {hoverProps, isHovered} = useHover({
    ...props,
    isDisabled
  });

  let contents = typeof rendered === 'string'
    ? <Text>{rendered}</Text>
    : rendered;

  let {modality} = useFocusVisible(props);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        {...mergeProps(optionProps, shouldFocusOnHover ? hoverProps : {})}
        ref={ref}
        className={classNames(
          styles,
          'spectrum-Menu-item',
          {
            'is-focused': shouldUseVirtualFocus && isFocused && modality === 'keyboard',
            'is-disabled': isDisabled,
            'is-selected': isSelected,
            'is-selectable': state.selectionManager.selectionMode !== 'none',
            'is-hovered': isHovered || isFocused && modality === 'pointer'
          }
        )}>
        <Grid
          UNSAFE_className={
            classNames(
              styles,
              'spectrum-Menu-itemGrid'
            )
          }>
          <SlotProvider
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
          </SlotProvider>
        </Grid>
      </div>
    </FocusRing>
  );
}
