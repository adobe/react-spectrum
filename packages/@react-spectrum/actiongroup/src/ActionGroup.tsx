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
import buttonStyles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {classNames, unwrapDOMRef, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMProps, DOMRef, SelectionMode, StyleProps} from '@react-types/shared';
import {ListState, useListState} from '@react-stately/list';
import {mergeProps} from '@react-aria/utils';
import {Node} from '@react-stately/collections';
import {PressResponder} from '@react-aria/interactions';
import {Provider} from '@react-spectrum/provider';
import React, {forwardRef, Key, ReactElement, useRef} from 'react';
import {SpectrumActionGroupProps} from '@react-types/actiongroup';
import styles from '@adobe/spectrum-css-temp/components/actiongroup/vars.css';
import {useActionGroup} from '@react-aria/actiongroup';
import {useActionGroupItem} from '@react-aria/actiongroup';
import {useProviderProps} from '@react-spectrum/provider';

/**
* An ActionGroup is a grouping of ActionButtons that are related to one another.
*/
function ActionGroup<T extends object>(props: SpectrumActionGroupProps<T>, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);

  let {
    isEmphasized,
    density,
    isJustified,
    isDisabled,
    selectionMode = 'single' as SelectionMode,
    orientation = 'horizontal',
    isQuiet,
    onAction,
    ...otherProps
  } = props;

  let domRef = useDOMRef(ref);
  let state = useListState({...props, selectionMode});
  let {actionGroupProps} = useActionGroup(props, state, domRef);
  let isVertical = orientation === 'vertical';
  let providerProps = {isEmphasized, isDisabled, isQuiet};
  let {styleProps} = useStyleProps(props);

  return (
    <div
      {...actionGroupProps}
      {...styleProps}
      ref={domRef}
      className={
        classNames(
          styles,
          'spectrum-ActionGroup',
          {
            'spectrum-ActionGroup--quiet': isQuiet,
            'spectrum-ActionGroup--vertical': isVertical,
            'spectrum-ActionGroup--compact': density === 'compact',
            'spectrum-ActionGroup--justified': isJustified
          },
          otherProps.UNSAFE_className
        )
      }>
      <Provider {...providerProps}>
        {[...state.collection].map((item) => (
          <ActionGroupItem
            key={item.key}
            onAction={onAction}
            isDisabled={isDisabled}
            isEmphasized={isEmphasized}
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
  state: ListState<T>,
  isDisabled: boolean,
  isEmphasized: boolean,
  onAction: (key: Key) => void
}

function ActionGroupItem<T>({item, state, isDisabled, isEmphasized, onAction}: ActionGroupItemProps<T>) {
  let ref = useRef();
  let {buttonProps} = useActionGroupItem({key: item.key}, state, unwrapDOMRef(ref));
  isDisabled = isDisabled || state.disabledKeys.has(item.key);
  let isSelected = state.selectionManager.isSelected(item.key);

  if (onAction && !isDisabled) {
    buttonProps = mergeProps(buttonProps, {
      onPress: () => onAction(item.key)
    });
  }

  let button = (
    // Use a PressResponder to send DOM props through.
    // ActionButton doesn't allow overriding the role by default.
    <PressResponder {...buttonProps}>
      <ActionButton
        ref={ref}
        UNSAFE_className={
          classNames(
            styles,
            'spectrum-ActionGroup-item',
            {
              'is-selected': isSelected
            },
            classNames(
              buttonStyles,
              {
                'spectrum-ActionButton--emphasized': isEmphasized,
                'is-selected': isSelected
              }
            )
          )
        }
        isDisabled={isDisabled}
        aria-label={item['aria-label']}>
        {item.rendered}
      </ActionButton>
    </PressResponder>
  );

  if (item.wrapper) {
    button = item.wrapper(button);
  }

  return button;
}
