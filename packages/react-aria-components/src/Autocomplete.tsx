/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaAutocompleteProps, useAutocomplete} from '@react-aria/autocomplete';
import {AutocompleteState, useAutocompleteState} from '@react-stately/autocomplete';
import {ContextValue, Provider, removeDataAttributes, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot} from './utils';
import {forwardRefType} from '@react-types/shared';
import {InputContext} from './Input';
import {LabelContext} from './Label';
import {MenuContext} from './Menu';
import {mergeProps, useObjectRef} from '@react-aria/utils';
import React, {createContext, ForwardedRef, forwardRef, KeyboardEvent, useCallback, useRef} from 'react';
import {TextContext} from './Text';
import {useFilter} from 'react-aria';

// TODO: I've kept isDisabled because it might be useful to a user for changing what the menu renders if the autocomplete is disabled,
// but what about isReadOnly. TBH is isReadOnly useful in the first place? What would a readonly Autocomplete do?
export interface AutocompleteRenderProps {
  /**
   * Whether the autocomplete is disabled.
   */
  isDisabled: boolean
}

export interface AutocompleteProps extends Omit<AriaAutocompleteProps, 'children' | 'placeholder' | 'label' | 'description' | 'errorMessage' | 'validationState' | 'validationBehavior'>,  RenderProps<AutocompleteRenderProps>, SlotProps {
  /** The filter function used to determine if a option should be included in the autocomplete list. */
  defaultFilter?: (textValue: string, inputValue: string) => boolean
}

interface InternalAutocompleteContextValue {
  register: (callback: (event: KeyboardEvent) => string) => void,
  filterFn: (nodeTextValue: string) => boolean,
  inputValue: string
}

export const AutocompleteContext = createContext<ContextValue<AutocompleteProps, HTMLInputElement>>(null);
export const AutocompleteStateContext = createContext<AutocompleteState | null>(null);
// This context is to pass the register and filter down to whatever collection component is wrapped by the Autocomplete
export const InternalAutocompleteContext = createContext<InternalAutocompleteContextValue | null>(null);

function Autocomplete(props: AutocompleteProps, ref: ForwardedRef<HTMLInputElement>) {
  // TODO: Needed for the onClose from MenuTrigger so that the menu is closed automatically. Probably won't have to do the same for other collection components,
  // but its a bit annoying since we could potentially need to do the same for every collection component Autocomplete will support?
  // Alternatively, this won't be a problem if we didn't use MenuContext below and instead used a generic autocomplete context so they don't collide.
  // Might be better if we do that since then the supported collection components would access that generic context instead and we wouldn't pull into unrelated
  // components when you are just using the Autocomplete and one other collection component
  let menuRef = useRef(null);
  let [contextMenuProps, contextMenuRef] = useContextProps({}, menuRef, MenuContext);

  [props, ref] = useContextProps(props, ref, AutocompleteContext);
  let {defaultFilter} = props;
  let state = useAutocompleteState(props);
  let inputRef = useObjectRef<HTMLInputElement>(ref);
  let [labelRef, label] = useSlot();
  let {contains} = useFilter({sensitivity: 'base'});
  let {
    inputProps,
    menuProps,
    labelProps,
    descriptionProps,
    register
  } = useAutocomplete({
    ...removeDataAttributes(props),
    label,
    inputRef
  }, state);

  let renderValues = {
    isDisabled: props.isDisabled || false
  };

  let renderProps = useRenderProps({
    ...props,
    values: renderValues
  });

  let filterFn = useCallback((nodeTextValue: string) => {
    if (defaultFilter) {
      return defaultFilter(nodeTextValue, state.inputValue);
    }
    return contains(nodeTextValue, state.inputValue);
  }, [state.inputValue, defaultFilter, contains]) ;

  return (
    <Provider
      values={[
        [AutocompleteStateContext, state],
        [LabelContext, {...labelProps, ref: labelRef}],
        [InputContext, {...inputProps, ref: inputRef}],
        // TODO: as mentioned above, maybe don't use MenuContext and instead just move the menu props onto the internal context?
        [MenuContext, {...mergeProps(contextMenuProps, menuProps), ref: contextMenuRef}],
        [TextContext, {
          slots: {
            description: descriptionProps
          }
        }],
        [InternalAutocompleteContext, {register, filterFn, inputValue: state.inputValue}]
      ]}>
      {renderProps.children}
    </Provider>
  );
}

/**
 * A autocomplete combines a text input with a menu, allowing users to filter a list of options to items matching a query.
 */
const _Autocomplete = /*#__PURE__*/ (forwardRef as forwardRefType)(Autocomplete);
export {_Autocomplete as Autocomplete};
