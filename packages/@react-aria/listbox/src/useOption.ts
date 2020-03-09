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

import {HTMLAttributes, Key, RefObject} from 'react';
import {ListState} from '@react-stately/list';
import {usePress} from '@react-aria/interactions';
import {useSelectableItem} from '@react-aria/selection';

interface OptionProps {
  isDisabled?: boolean,
  isSelected?: boolean,
  key?: Key,
  ref?: RefObject<HTMLElement>,
  isVirtualized?: boolean
}

interface OptionAria {
  optionProps: HTMLAttributes<HTMLElement>
}

export function useOption<T>(props: OptionProps, state: ListState<T>): OptionAria {
  let {
    isSelected,
    isDisabled,
    key,
    ref,
    isVirtualized
  } = props;

  let optionProps = {
    role: 'option',
    'aria-disabled': isDisabled,
    'aria-selected': isSelected
  };

  if (isVirtualized) {
    optionProps['aria-posinset'] = state.collection.getItem(key).index;
    optionProps['aria-setsize'] = state.collection.size;
  }

  let {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    itemKey: key,
    itemRef: ref,
    isVirtualized
  });

  let {pressProps} = usePress({...itemProps, isDisabled});

  return {
    optionProps: {
      ...optionProps,
      ...pressProps
    }
  };
}
