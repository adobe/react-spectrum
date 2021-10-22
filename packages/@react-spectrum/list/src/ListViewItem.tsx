/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {Checkbox} from '@react-spectrum/checkbox';
import ChevronLeftMedium from '@spectrum-icons/ui/ChevronLeftMedium';
import ChevronRightMedium from '@spectrum-icons/ui/ChevronRightMedium';
import {classNames, ClearSlots, SlotProvider} from '@react-spectrum/utils';
import {Content} from '@react-spectrum/view';
import {Grid} from '@react-spectrum/layout';
import listStyles from './listview.css';
import {ListViewContext} from './ListView';
import {mergeProps} from '@react-aria/utils';
import React, {useContext, useRef} from 'react';
import {useFocusRing} from '@react-aria/focus';
import {useGridCell, useGridRow, useGridSelectionCheckbox} from '@react-aria/grid';
import {useHover, usePress} from '@react-aria/interactions';
import {useLocale} from '@react-aria/i18n';

export function ListViewItem(props) {
  let {
    item,
    onAction
  } = props;
  let cellNode = [...item.childNodes][0];
  let {state} = useContext(ListViewContext);
  let {direction} = useLocale();
  let rowRef = useRef<HTMLDivElement>();
  let cellRef =  useRef<HTMLDivElement>();
  let {
    isFocusVisible: isFocusVisibleWithin,
    focusProps: focusWithinProps
  } = useFocusRing({within: true});
  let {isFocusVisible, focusProps} = useFocusRing();
  let allowsInteraction = state.selectionManager.selectionMode !== 'none' || onAction;
  let isDisabled = !allowsInteraction || state.disabledKeys.has(item.key);
  let {hoverProps, isHovered} = useHover({isDisabled});
  let {pressProps, isPressed} = usePress({isDisabled});
  let {rowProps} = useGridRow({
    node: item,
    isVirtualized: true,
    onAction: onAction ? () => onAction(item.key) : null
  }, state, rowRef);
  let {gridCellProps} = useGridCell({
    node: cellNode,
    focusMode: 'cell'
  }, state, cellRef);
  const mergedProps = mergeProps(
    gridCellProps,
    hoverProps,
    focusWithinProps,
    focusProps
  );
  let {checkboxProps} = useGridSelectionCheckbox({...props, key: item.key}, state);

  let chevron = null;
  if (item.props.hasChildItems) {
    chevron = direction === 'ltr'
      ? (
        <ChevronRightMedium
          aria-hidden="true"
          UNSAFE_className={listStyles['react-spectrum-ListViewItem-parentIndicator']} />
      )
      : (
        <ChevronLeftMedium
          aria-hidden="true"
          UNSAFE_className={listStyles['react-spectrum-ListViewItem-parentIndicator']} />
      );
  }

  let showCheckbox = state.selectionManager.selectionMode !== 'none' && state.selectionManager.selectionBehavior === 'toggle';
  let isSelected = state.selectionManager.isSelected(item.key);
  return (
    <div
      {...mergeProps(rowProps, pressProps)}
      ref={rowRef}>
      <div
        className={
          classNames(
            listStyles,
            'react-spectrum-ListViewItem',
            {
              'is-active': isPressed,
              'is-focused': isFocusVisibleWithin,
              'focus-ring': isFocusVisible,
              'is-hovered': isHovered,
              'is-selected': isSelected,
              'react-spectrum-ListViewItem--highlightSelection': state.selectionManager.selectionBehavior === 'replace' && (isSelected || state.selectionManager.isSelected(item.nextKey))
            }
          )
        }
        ref={cellRef}
        {...mergedProps}>
        <Grid UNSAFE_className={listStyles['react-spectrum-ListViewItem-grid']}>
          {showCheckbox && (
            <Checkbox
              UNSAFE_className={listStyles['react-spectrum-ListViewItem-checkbox']}
              {...checkboxProps}
              isEmphasized />
          )}
          <SlotProvider
            slots={{
              content: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-content']},
              text: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-content']},
              description: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-description']},
              icon: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-icon'], size: 'M'},
              image: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-image']},
              link: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-content'], isQuiet: true},
              actionButton: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-actions'], isQuiet: true},
              actionGroup: {
                UNSAFE_className: listStyles['react-spectrum-ListViewItem-actions'],
                isQuiet: true,
                density: 'compact'
              },
              actionMenu: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-actionmenu'], isQuiet: true}
            }}>
            {typeof item.rendered === 'string' ? <Content>{item.rendered}</Content> : item.rendered}
            <ClearSlots>
              {chevron}
            </ClearSlots>
          </SlotProvider>
        </Grid>
      </div>
    </div>
  );
}
