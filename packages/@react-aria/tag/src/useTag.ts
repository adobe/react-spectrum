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

import {ButtonHTMLAttributes, KeyboardEvent} from 'react';
import {DOMAttributes} from '@react-types/shared';
import {filterDOMProps, mergeProps, useId} from '@react-aria/utils';
import {GridCollection} from '@react-stately/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {TagGroupState} from '@react-stately/tag';
import {TagProps} from '@react-types/tag';
import {useGridListItem} from '@react-aria/gridlist';
import {useLocalizedStringFormatter} from '@react-aria/i18n';


export interface TagAria {
  labelProps: DOMAttributes,
  tagProps: DOMAttributes,
  tagRowProps: DOMAttributes,
  clearButtonProps: ButtonHTMLAttributes<HTMLButtonElement>
}

export function useTag<T>(props: TagProps<T>, state: TagGroupState<T>): TagAria {
  let {
    isFocused,
    allowsRemoving,
    onRemove,
    item,
    tagRowRef
  } = props;
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let removeString = stringFormatter.format('remove');
  let labelId = useId();
  let buttonId = useId();

  let {rowProps, gridCellProps} = useGridListItem({
    node: item
  }, state, tagRowRef);

  // We want TagKeyboardDelegate to handle keyboard events instead.
  delete rowProps.onKeyDownCapture;


  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Delete' || e.key === 'Backspace' || e.key === ' ') {
      onRemove(item.key);
      e.preventDefault();
    }
  }
  let pressProps = {
    onPress: () => onRemove?.(item.key)
  };

  isFocused = isFocused || state.selectionManager.focusedKey === item.key;
  let domProps = filterDOMProps(props);
  return {
    clearButtonProps: mergeProps(pressProps, {
      'aria-label': removeString,
      'aria-labelledby': `${buttonId} ${labelId}`,
      id: buttonId
    }),
    labelProps: {
      id: labelId
    },
    tagRowProps: {
      ...rowProps,
      tabIndex: (isFocused || state.selectionManager.focusedKey == null) ? 0 : -1,
      onKeyDown: allowsRemoving ? onKeyDown : null
    },
    tagProps: mergeProps(domProps, gridCellProps, {
      'aria-errormessage': props['aria-errormessage'],
      'aria-label': props['aria-label']
    })
  };
}
