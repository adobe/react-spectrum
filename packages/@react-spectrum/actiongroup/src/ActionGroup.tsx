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
import {classNames, filterDOMProps, unwrapDOMRef, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMProps, DOMRef, SelectionMode, StyleProps} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
import {Node} from '@react-stately/collections';
import {Provider} from '@react-spectrum/provider';
import React, {forwardRef, Key, ReactElement, useRef} from 'react';
import {SpectrumActionGroupProps} from '@react-types/actiongroup';
import styles from '@adobe/spectrum-css-temp/components/actiongroup/vars.css';
import {useActionGroup} from '@react-aria/actiongroup';
import {useProviderProps} from '@react-spectrum/provider';
import {useSelectableItem} from '@react-aria/selection';

function ActionGroup<T extends object>(props: SpectrumActionGroupProps<T>, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);

  let {
    isEmphasized,
    isConnected, // no quiet option available in this mode
    isJustified,
    isDisabled,
    selectionMode = 'single' as SelectionMode,
    orientation = 'horizontal',
    isQuiet,
    onAction,
    ...otherProps
  } = props;

  let domRef = useDOMRef(ref);
  let state = useActionGroupState({...props, selectionMode});
  let {actionGroupProps, buttonProps} = useActionGroup(props, state, domRef);
  let isVertical = orientation === 'vertical';
  let providerProps = {isEmphasized, isDisabled, isQuiet};
  let {styleProps} = useStyleProps(props);

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...actionGroupProps}
      {...styleProps}
      ref={domRef}
      className={
        classNames(
          styles,
          'spectrum-ActionButtonGroup',
          classNames(buttonStyles, {
            'spectrum-ButtonGroup--vertical': isVertical,
            'spectrum-ButtonGroup--connected': isConnected && !isQuiet,
            'spectrum-ButtonGroup--justified': isJustified
          }),
          otherProps.UNSAFE_className
        )
      }>
      <Provider {...providerProps}>
        {[...state.collection].map((item, index) => (
          <ActionGroupItem
            key={item.key}
            {...buttonProps[index]}
            onAction={onAction}
            isDisabled={isDisabled}
            UNSAFE_className={classNames(buttonStyles, 'spectrum-ButtonGroup-item')}
            item={item}
            state={state} />
        ))}
      </Provider>
    </div>
  );
}

const _ActionGroup = forwardRef(ActionGroup) as <T>(props: SpectrumActionGroupProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;
export {_ActionGroup as ActionGroup};

interface ActionGroupItemProps<T> extends DOMProps, StyleProps {
  item: Node<T>,
  state: ActionGroupState<T>,
  isDisabled: boolean,
  onAction: (key: Key) => void
}

function ActionGroupItem<T>({item, state, isDisabled, onAction, ...otherProps}: ActionGroupItemProps<T>) {
  let ref = useRef();
  let {itemProps} = useSelectableItem({
    selectionManager: state && state.selectionManager,
    itemKey: item && item.key,
    itemRef: unwrapDOMRef(ref)
  });

  let buttonProps = mergeProps(itemProps, otherProps);
  isDisabled = isDisabled || state.disabledKeys.has(item.key);
  let isSelected = state.selectionManager.isSelected(item.key);

  if (onAction && !isDisabled) {
    buttonProps = mergeProps(buttonProps, {
      onPress: () => onAction(item.key)
    });
  }

  let button = (
    <ActionButton
      {...buttonProps}
      ref={ref}
      isSelected={state.selectionManager.selectionMode !== 'none' ? isSelected : null}
      isDisabled={isDisabled}
      aria-label={item['aria-label']}>
      {item.rendered}
    </ActionButton>
  );

  if (item.wrapper) {
    button = item.wrapper(button);
  }

  return button;
}
