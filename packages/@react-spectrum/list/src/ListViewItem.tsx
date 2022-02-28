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
import type {DraggableItemResult} from '@react-aria/dnd';
import DragHandle from './DragHandle';
import {FocusRing, useFocusRing} from '@react-aria/focus';
import {Grid} from '@react-spectrum/layout';
import listStyles from './listview.css';
import {ListViewContext} from './ListView';
import {mergeProps} from '@react-aria/utils';
import React, {useContext, useRef} from 'react';
import {useButton} from '@react-aria/button';
import {useGridCell, useGridRow, useGridSelectionCheckbox} from '@react-aria/grid';
import {useHover, usePress} from '@react-aria/interactions';
import {useLocale} from '@react-aria/i18n';
import {useVisuallyHidden} from '@react-aria/visually-hidden';

export function ListViewItem(props) {
  let {
    item,
    isEmphasized,
    dragHooks
  } = props;
  let cellNode = [...item.childNodes][0];
  let {state, dragState, onAction, isListDraggable} = useContext(ListViewContext);
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
  let isDraggable = dragState?.isDraggable(item.key) && !isDisabled;
  let {hoverProps, isHovered} = useHover({isDisabled});
  let {pressProps, isPressed} = usePress({isDisabled});
  let {rowProps} = useGridRow({
    node: item,
    isVirtualized: true,
    onAction: onAction ? () => onAction(item.key) : undefined,
    shouldSelectOnPressUp: isDraggable
  }, state, rowRef);
  let {gridCellProps} = useGridCell({
    node: cellNode,
    focusMode: 'cell'
  }, state, cellRef);
  let draggableItem: DraggableItemResult;
  if (isListDraggable) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    draggableItem = dragHooks.useDraggableItem({key: item.key}, dragState);
  }
  const mergedProps = mergeProps(
    gridCellProps,
    hoverProps,
    focusWithinProps,
    focusProps
  );
  let {checkboxProps} = useGridSelectionCheckbox({...props, key: item.key}, state);

  let dragButtonRef = React.useRef();
  let {buttonProps} = useButton({
    ...draggableItem?.dragButtonProps,
    elementType: 'div'
  }, dragButtonRef);

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
  let showDragHandle = isDraggable && (isFocusVisibleWithin || isHovered || isPressed);
  let {visuallyHiddenProps} = useVisuallyHidden();
  return (
    <div
      {...mergeProps(rowProps, pressProps, isDraggable && draggableItem?.dragProps)}
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
              'is-previous-selected': state.selectionManager.isSelected(item.prevKey),
              'react-spectrum-ListViewItem--highlightSelection': state.selectionManager.selectionBehavior === 'replace' && (isSelected || state.selectionManager.isSelected(item.nextKey)),
              'react-spectrum-ListViewItem--draggable': isDraggable
            }
          )
        }
        ref={cellRef}
        {...mergedProps}>
        <Grid UNSAFE_className={listStyles['react-spectrum-ListViewItem-grid']}>
          {isListDraggable &&
            <div className={listStyles['react-spectrum-ListViewItem-draghandle-container']}>
              {isDraggable &&
                <FocusRing focusRingClass={classNames(listStyles, 'focus-ring')}>
                  <div
                    {...buttonProps as React.HTMLAttributes<HTMLElement>}
                    className={
                      classNames(
                        listStyles,
                        'react-spectrum-ListViewItem-draghandle-button'
                      )
                    }
                    style={!showDragHandle ? {...visuallyHiddenProps.style} : {}}
                    ref={dragButtonRef}
                    draggable="true">
                    <DragHandle />
                  </div>
                </FocusRing>
              }
            </div>
          }
          {showCheckbox &&
            <Checkbox
              UNSAFE_className={listStyles['react-spectrum-ListViewItem-checkbox']}
              {...checkboxProps}
              isEmphasized={isEmphasized} />
          }
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
