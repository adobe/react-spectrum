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

import {FocusEvents, KeyboardEvents} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
import React, {HTMLAttributes, ReactNode, RefObject, useContext, useEffect} from 'react';
import {useFocus, useKeyboard} from '@react-aria/interactions';

interface FocusableProps extends FocusEvents, KeyboardEvents {
  isDisabled?: boolean,
  autoFocus?: boolean
}

interface FocusableProviderProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
}

const FocusableContext = React.createContext<HTMLAttributes<HTMLElement>>(null);
export function FocusableProvider(props: FocusableProviderProps) {
  let {children, ...domProps} = props;
  return (
    <FocusableContext.Provider value={domProps}>
      {children}
    </FocusableContext.Provider>
  );
}

export function useFocusable(props: FocusableProps, domRef?: RefObject<HTMLElement>) {
  // TODO: get rid of these and pass props through FocusableProvider instead
  let {focusProps} = useFocus(props);
  let {keyboardProps} = useKeyboard(props);
  let domProps = useContext(FocusableContext);

  useEffect(() => {
    if (props.autoFocus && domRef && domRef.current) {
      domRef.current.focus();
    }
  }, [props.autoFocus, domRef]);

  return {
    focusableProps: mergeProps(mergeProps(focusProps, keyboardProps), domProps)
  };
}
