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
import {classNames, SlotProvider} from '@react-spectrum/utils';
import {Content} from '@react-spectrum/view';
import {Grid} from '@react-spectrum/layout';
// @ts-ignore
import intlMessages from '../intl/*.json';
import listStyles from './listview.css';
import {ListViewContext} from './ListView';
import {mergeProps, useId} from '@react-aria/utils';
import React, {useContext, useRef} from 'react';
import {useFocusRing} from '@react-aria/focus';
import {useGridCell, useGridRow} from '@react-aria/grid';
import {useHover} from '@react-aria/interactions';
import {useLocale, useMessageFormatter} from '@react-aria/i18n';

export function ListViewItem(props) {
  let {
    item
  } = props;
  let {onAction, state, selectionMode} = useContext(ListViewContext);
  let {direction} = useLocale();
  let ref = useRef<HTMLDivElement>();
  let {
    isFocusVisible: isFocusVisibleWithin,
    focusProps: focusWithinProps
  } = useFocusRing({within: true});
  let {isFocusVisible, focusProps} = useFocusRing();
  let isDisabled = state.disabledKeys.has(item.key);
  let {hoverProps, isHovered} = useHover({isDisabled});
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
    {...((state.selectionManager.selectionMode === 'none' && item.props.hasChildItems) && {onPointerUp: () => onAction(item.key)})}
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

  let showCheckbox = state.selectionManager.selectionMode !== 'none' || selectionMode;
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
              'is-hovered': isHovered
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
              text: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-content']},
              description: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-description']},
              icon: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-icon'], size: 'M'},
              image: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-image']},
              actionGroup: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-actions'], isQuiet: true, density: 'compact'},
              actionButton: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-actions'], isQuiet: true},
              actionMenu: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-actions'], isQuiet: true},
              link: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-content'], isQuiet: true}
            }}>
            {typeof item.rendered === 'string' ? <Content>{item.rendered}</Content> : item.rendered}
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

  const formatMessage = useMessageFormatter(intlMessages);

  return {
    checkboxProps: {
      id: checkboxId,
      'aria-label': formatMessage('select'),
      isSelected,
      isDisabled: isDisabled || manager.selectionMode === 'none',
      onChange
    }
  };
}
