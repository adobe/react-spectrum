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

import {ActionGroupButton, SpectrumActionGroupProps} from '@react-types/actiongroup';
import {ActionGroupState, useActionGroupState} from '@react-stately/actiongroup';
import buttonStyles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {classNames, filterDOMProps, useSlotProps} from '@react-spectrum/utils';
import {CollectionBase, SelectionMode} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
import {PressResponder} from '@react-aria/interactions';
import {Provider} from '@react-spectrum/provider';
import React, {AllHTMLAttributes, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/buttongroup/vars.css';
import {useActionGroup} from '@react-aria/actiongroup';
import {useSelectableItem} from '@react-aria/selection';

export function ActionGroup<T>(props: CollectionBase<T> & SpectrumActionGroupProps) {
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

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...actionGroupProps}
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
      } >
      <Provider {...providerProps}>
        {
          state.collection.items.map((item) => (
            <ActionGroupItem
              key={item.key}
              {...buttonProps}
              className={classNames(buttonStyles, 'spectrum-ButtonGroup-item')}
              item={item}
              state={state} />
          ))
        }
      </Provider>
    </div>
  );
}

export interface ActionGroupItemProps extends AllHTMLAttributes<HTMLButtonElement> {
  item: ActionGroupButton,
  state: ActionGroupState
}

export function ActionGroupItem({item, state, ...otherProps}: ActionGroupItemProps) {
  let ref = useRef<HTMLDivElement>();
  let {itemProps} = useSelectableItem({
    selectionManager: state && state.selectionManager,
    itemKey: item && item.key,
    itemRef: ref
  });

  let buttonProps = mergeProps(itemProps, otherProps);

  return (
    <PressResponder ref={ref} {...buttonProps} >
      {item}
    </PressResponder>
  );

}
