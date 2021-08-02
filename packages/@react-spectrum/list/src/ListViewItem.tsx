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
import {classNames, SlotProvider, useIsMobileDevice} from '@react-spectrum/utils';
import {Grid} from '@react-spectrum/layout';
import listStyles from './listview.css';
import {ListViewContext} from './ListView';
import {mergeProps, useId} from '@react-aria/utils';
import React, {useContext, useRef} from 'react';
import {useFocusRing} from '@react-aria/focus';
import {useGridCell, useGridRow} from '@react-aria/grid';
import {useHover} from '@react-aria/interactions';
import {useLocale} from '@react-aria/i18n';


const SELECTION_INTERVAL = 1000;
let selectionTimeout;

export function ListViewItem(props) {
  let {
    item
  } = props;
  let {onAction, selectionStyle, state, selectionMode, setSelectionMode} = useContext(ListViewContext);
  let {direction} = useLocale();
  let ref = useRef<HTMLDivElement>();
  let isMobile = useIsMobileDevice();
  let {
    isFocusVisible: isFocusVisibleWithin,
    focusProps: focusWithinProps
  } = useFocusRing({within: true});
  let {isFocusVisible, focusProps} = useFocusRing();
  let {hoverProps, isHovered} = useHover({});
  let {rowProps} = useGridRow({
    node: item,
    isVirtualized: true
  }, state, ref);
  let {gridCellProps} = useGridCell({
    node: item,
    focusMode: 'cell'
  }, state, ref);
  const mergedProps = mergeProps(
    gridCellProps,
    hoverProps,
    focusWithinProps,
    focusProps,
    {...((state.selectionManager.selectionMode === 'none' && item.props.hasChildItems) && {onPointerUp: () => onAction(item.key)})},
    {...((isMobile) && {
      onPointerUp: () => {
        console.log('action', item.key);
        onAction(item.key);
      },
      onTouchStart: () => {
        selectionTimeout = setTimeout(() => {
          setSelectionMode(true);
        }, SELECTION_INTERVAL);
      },
      onTouchEnd: () => {
        if (selectionTimeout) {
          clearTimeout(selectionTimeout);
        }
      }
    })}
  );
  let {checkboxProps} = useListSelectionCheckbox(props, state);

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

  let showCheckbox = (!isMobile && selectionStyle === 'checkbox' && state.selectionManager.selectionMode !== 'none') || selectionMode;
  return (
    <div
      {...rowProps}>
      <div
        className={
          classNames(
            listStyles,
            'react-spectrum-ListViewItem',
            {
              'is-focused': isFocusVisibleWithin,
              'focus-ring': isFocusVisible,
              'is-hovered': isHovered,
              'react-spectrum-ListViewItem-selected': selectionStyle === 'highlight' && state.selectionManager.isSelected(item.key)
            }
          )
        }
        ref={ref}
        {...mergedProps}>
        <Grid UNSAFE_className={listStyles['react-spectrum-ListViewItem-grid']} UNSAFE_style={{minHeight: '32px'}}>
          {showCheckbox &&
          <Checkbox UNSAFE_style={{marginLeft: '4px', paddingRight: '0'}} {...checkboxProps} isEmphasized />}
          <SlotProvider
            slots={{
              content: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-content']},
              icon: {size: 'M'},
              image: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-image']},
              actionGroup: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-actionGroup'], isQuiet: true, density: 'compact'}
            }}>
            {item.rendered}
            {chevron}
          </SlotProvider>
        </Grid>
      </div>
    </div>
  );
}

function useListSelectionCheckbox(props, state) {
  let {item} = props;
  let {key} = item;

  let manager = state.selectionManager;
  let checkboxId = useId();
  let isDisabled = state.disabledKeys.has(key);
  let isSelected = state.selectionManager.isSelected(key);

  let onChange = () => manager.select(key);

  return {
    checkboxProps: {
      id: checkboxId,
      isSelected,
      isDisabled: isDisabled || manager.selectionMode === 'none',
      onChange
    }
  };
}
