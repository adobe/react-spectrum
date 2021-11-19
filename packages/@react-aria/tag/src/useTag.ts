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

import {ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent} from 'react';
import {filterDOMProps, mergeProps, useId} from '@react-aria/utils';
import {GridState} from '@react-stately/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {TagProps} from '@react-types/tag';
import {useGridCell, useGridRow} from '@react-aria/grid';
import {useMessageFormatter} from '@react-aria/i18n';


export interface TagAria {
  tagProps: HTMLAttributes<HTMLElement>,
  labelProps: HTMLAttributes<HTMLElement>,
  clearButtonProps: ButtonHTMLAttributes<HTMLButtonElement>
}

export function useTag(props: TagProps<any>, state: GridState<any, any>): TagAria {
  const {
    isDisabled,
    isRemovable,
    onRemove,
    children,
    item,
    tagRef,
    labelRef
  } = props;
  const formatMessage = useMessageFormatter(intlMessages);
  const removeString = formatMessage('remove');
  const tagId = useId();
  const buttonId = useId();

  let {rowProps} = useGridRow({
    node: item
  }, state, tagRef);
  let {gridCellProps} = useGridCell({
    node: [...item.childNodes][0],
    focusMode: 'cell'
  }, state, labelRef);

  function onKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      onRemove(children, e);
      e.preventDefault();
    }
  }
  const pressProps = {
    onPress: e => onRemove?.(children, e)
  };

  let domProps = filterDOMProps(props);
  return {
    tagProps: mergeProps(domProps, rowProps, {
      'aria-errormessage': props['aria-errormessage'],
      onKeyDown: !isDisabled && isRemovable ? onKeyDown : null,
      tabIndex: isDisabled ? -1 : 0,
      ref: tagRef
    }),
    labelProps: mergeProps(gridCellProps, {
      id: tagId,
      ref: labelRef
    }),
    clearButtonProps: mergeProps(pressProps, gridCellProps, {
      'aria-label': removeString,
      'aria-labelledby': `${buttonId} ${tagId}`,
      id: buttonId,
      title: removeString,
      isDisabled
    })
  };
}
