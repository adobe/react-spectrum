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

import {CheckboxProps} from '@react-types/checkbox';
import {DOMProps} from '@react-types/shared';
import {getRowLabelledBy} from './utils';
import {GridState} from '@react-stately/grid';
import {Key} from 'react';
import {useId} from '@react-aria/utils';

interface SelectionCheckboxProps {
  key: Key
}

interface SelectionCheckboxAria {
  checkboxProps: CheckboxProps & DOMProps,
}

export function useSelectionCheckbox<T>(props: SelectionCheckboxProps, state: GridState<T>): SelectionCheckboxAria {
  let {
    key
  } = props;

  let checkboxId = useId();
  let isSelected = state.collection.getItem(key).isSelected;

  return {
    checkboxProps: {
      id: checkboxId,
      'aria-label': 'Select',
      'aria-labelledby': `${checkboxId} ${getRowLabelledBy(state, key)}`,
      isSelected,
      onChange: () => state.selectionManager.toggleSelection(key)
    }
  };
}

export function useSelectAllCheckbox<T>(state: GridState<T>): SelectionCheckboxAria {
  let {isEmpty, isSelectAll} = state.selectionManager;
  return {
    checkboxProps: {
      'aria-label': 'Select All',
      isSelected: isSelectAll,
      isIndeterminate: !isEmpty && !isSelectAll,
      onChange: () => state.selectionManager.toggleSelectAll()
    }
  };
}
