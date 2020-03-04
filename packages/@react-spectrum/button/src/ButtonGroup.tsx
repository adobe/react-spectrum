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

import {ActionButton} from '../src';
import {ButtonGroupButton, SpectrumButtonGroupProps} from '@react-types/button';
import {ButtonGroupState, useButtonGroupState} from '@react-stately/button';
import buttonStyles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {CollectionBase, SelectionMode} from '@react-types/shared';
import {CollectionsContext} from '@react-stately/collections';
import {mergeProps} from '@react-aria/utils';
import {Provider} from '@react-spectrum/provider';
import React, {AllHTMLAttributes, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/buttongroup/vars.css';
import {useButtonGroup} from '@react-aria/button';
import {useSelectableItem} from '@react-aria/selection';

export function ButtonGroup<T>(props: CollectionBase<T> & SpectrumButtonGroupProps<T>) {
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

  let state = useButtonGroupState({...props, selectionMode});

  let {buttonGroupProps, buttonProps} = useButtonGroup(props, state);

  let isVertical = orientation === 'vertical';

  let providerProps = {isEmphasized, isDisabled, isQuiet};

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...buttonGroupProps}
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
        <CollectionsContext.Provider
          value={{itemComponent: (item) => <ButtonGroupItem state={state} item={item} {...buttonProps} />}}>
          {state.buttonCollection.items}
        </CollectionsContext.Provider>
      </Provider>
    </div>
  );
}

export interface ButtonGroupItemProps<T> extends AllHTMLAttributes<HTMLButtonElement> {
  item: ButtonGroupButton<T>,
  state: ButtonGroupState
}

export function ButtonGroupItem<T>(props: ButtonGroupItemProps<T>) {
  let {item, state, ...otherProps} = props;

  let ref = useRef();
  let {itemProps} = useSelectableItem({
    selectionManager: state && state.selectionManager,
    itemKey: item && item.key,
    itemRef: ref
  });

  let ariaProps = mergeProps(itemProps, item);
  let buttonProps = mergeProps(ariaProps, otherProps);

  return (
    <ActionButton ref={ref} {...buttonProps} />
  );

}
