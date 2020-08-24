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

import {AriaButtonProps} from '@react-types/button';
import {AriaSelectProps} from '@react-types/select';
import {filterDOMProps, mergeProps, useId} from '@react-aria/utils';
import {HTMLAttributes, RefObject, useMemo} from 'react';
import {KeyboardDelegate} from '@react-types/shared';
import {ListKeyboardDelegate, useTypeSelect} from '@react-aria/selection';
import {SelectState} from '@react-stately/select';
import {setInteractionModality} from '@react-aria/interactions';
import {useCollator} from '@react-aria/i18n';
import {useLabel} from '@react-aria/label';
import {useMenuTrigger} from '@react-aria/menu';

interface AriaSelectOptions<T> extends AriaSelectProps<T> {
  /**
   * An optional keyboard delegate implementation for type to select,
   * to override the default.
   */
  keyboardDelegate?: KeyboardDelegate
}

interface SelectAria {
  /** Props for the label element. */
  labelProps: HTMLAttributes<HTMLElement>,

  /** Props for the popup trigger element. */
  triggerProps: AriaButtonProps,

  /** Props for the element representing the selected value. */
  valueProps: HTMLAttributes<HTMLElement>,

  /** Props for the popup. */
  menuProps: HTMLAttributes<HTMLElement>
}

/**
 * Provides the behavior and accessibility implementation for a select component.
 * A select displays a collapsible list of options and allows a user to select one of them.
 * @param props - Props for the select.
 * @param state - State for the select, as returned by `useListState`.
 */
export function useSelect<T>(props: AriaSelectOptions<T>, state: SelectState<T>, ref: RefObject<HTMLElement>): SelectAria {
  let {
    keyboardDelegate
  } = props;

  // By default, a KeyboardDelegate is provided which uses the DOM to query layout information (e.g. for page up/page down).
  // When virtualized, the layout object will be passed in as a prop and override this.
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let delegate = useMemo(() => keyboardDelegate || new ListKeyboardDelegate(state.collection, state.disabledKeys, null, collator), [keyboardDelegate, state.collection, state.disabledKeys, collator]);

  let {menuTriggerProps, menuProps} = useMenuTrigger(
    {
      type: 'listbox'
    },
    state,
    ref
  );

  let {typeSelectProps} = useTypeSelect({
    keyboardDelegate: delegate,
    selectionManager: state.selectionManager,
    onTypeSelect(key) {
      state.setSelectedKey(key);
    }
  });

  let {labelProps, fieldProps} = useLabel({
    ...props,
    labelElementType: 'span'
  });

  let domProps = filterDOMProps(props, {labelable: true});
  let triggerProps = mergeProps(mergeProps(menuTriggerProps, fieldProps), typeSelectProps);
  let valueId = useId();

  return {
    labelProps: {
      ...labelProps,
      onClick: () => {
        if (!props.isDisabled) {
          ref.current.focus();

          // Show the focus ring so the user knows where focus went
          setInteractionModality('keyboard');
        }
      }
    },
    triggerProps: mergeProps(domProps, {
      ...triggerProps,
      'aria-labelledby': [
        triggerProps['aria-labelledby'],
        triggerProps['aria-label'] && !triggerProps['aria-labelledby'] ? triggerProps.id : null,
        valueId
      ].filter(Boolean).join(' '),
      onFocus() {
        state.setFocused(true);
      },
      onBlur() {
        state.setFocused(false);
      }
    }),
    valueProps: {
      id: valueId
    },
    menuProps: {
      ...menuProps,
      'aria-labelledby': [
        fieldProps['aria-labelledby'],
        triggerProps['aria-label'] && !fieldProps['aria-labelledby'] ? triggerProps.id : null
      ].filter(Boolean).join(' ')
    }
  };
}
