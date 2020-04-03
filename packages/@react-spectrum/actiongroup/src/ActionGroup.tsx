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

import {ActionButton} from '@react-spectrum/button';
import {ActionGroupState, useActionGroupState} from '@react-stately/actiongroup';
import buttonStyles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {classNames, filterDOMProps, useDOMRef, useSlotProps} from '@react-spectrum/utils';
import {DOMProps, DOMRef, SelectionMode, StyleProps} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
import {Node} from '@react-stately/collections';
import {Provider} from '@react-spectrum/provider';
import React, {useRef} from 'react';
import {SpectrumActionGroupProps} from '@react-types/actiongroup';
import styles from '@adobe/spectrum-css-temp/components/buttongroup/vars.css';
import {useActionGroup} from '@react-aria/actiongroup';
import {useSelectableItem} from '@react-aria/selection';

export function ActionGroup<T>(props: SpectrumActionGroupProps<T>, ref: DOMRef<HTMLDivElement>) {
  props = useSlotProps(props);
  let {
    isEmphasized,
    isConnected, // no quiet option available in this mode
    isJustified,
    isDisabled,
    selectionMode = 'single' as SelectionMode,
    orientation = 'horizontal',
    isQuiet,
    ...otherProps
  } = props;

  let state = useActionGroupState({...props, selectionMode});
  let {actionGroupProps, buttonProps} = useActionGroup(props, state);
  let isVertical = orientation === 'vertical';
  let providerProps = {isEmphasized, isDisabled, isQuiet};
  let domRef = useDOMRef(ref);

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...actionGroupProps}
      ref={domRef}
      className={
        classNames(
          styles,
          'spectrum-ButtonGroup',
          classNames(buttonStyles, {
            'spectrum-ButtonGroup--vertical': isVertical,
            'spectrum-ButtonGroup--connected': isConnected && !isQuiet,
            'spectrum-ButtonGroup--justified': isJustified
          }),
          otherProps.UNSAFE_className
        )
      }>
      <Provider {...providerProps}>
        {[...state.collection].map((item) => (
          <ActionGroupItem
            key={item.key}
            {...buttonProps}
            UNSAFE_className={classNames(buttonStyles, 'spectrum-ButtonGroup-item')}
            item={item}
            state={state} />
        ))}
      </Provider>
    </div>
  );
}

export interface ActionGroupItemProps<T> extends DOMProps, StyleProps {
  item: Node<T>,
  state: ActionGroupState<T>
}

export function ActionGroupItem<T>({item, state, ...otherProps}: ActionGroupItemProps<T>) {
  let ref = useRef();
  let {itemProps} = useSelectableItem({
    selectionManager: state && state.selectionManager,
    itemKey: item && item.key,
    itemRef: ref
  });

  let buttonProps = mergeProps(itemProps, otherProps);

  return (
    <ActionButton
      {...buttonProps}
      ref={ref}
      isSelected={state.selectionManager.selectionMode !== 'none' ? item.isSelected : null}
      isDisabled={item.isDisabled}>
      {item.rendered}
    </ActionButton>
  );
}
