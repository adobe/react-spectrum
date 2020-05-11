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
import React, {HTMLAttributes, MutableRefObject, ReactNode, RefObject, useContext, useEffect} from 'react';
import {useFocus, useKeyboard} from '@react-aria/interactions';

interface FocusableProps extends FocusEvents, KeyboardEvents {
  isDisabled?: boolean,
  autoFocus?: boolean
}

interface FocusableContextProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode,
  ref?: MutableRefObject<HTMLElement>
}

export const FocusableContext = React.createContext<FocusableContextProps>(null);

export function useFocsuableContext(ref: RefObject<HTMLElement>): FocusableContextProps {
  let context = useContext(FocusableContext) || {} as FocusableContextProps;

  useEffect(() => {
    if (context && context.ref) {
      context.ref.current = ref.current;
      return () => {
        context.ref.current = null;
      };
    }
  }, [context, ref]);

  return context;
}

export const FocusableProvider = React.forwardRef(({children, ...props}: FocusableContextProps, ref: RefObject<HTMLElement>) => {
  let context = {
    ...props,
    ref
  };

  return (
    <FocusableContext.Provider value={context}>
      {children}
    </FocusableContext.Provider>
  );
});

export function useFocusable(props: FocusableProps, domRef?: RefObject<HTMLElement>) {
  let {focusProps} = useFocus(props);
  let {keyboardProps} = useKeyboard(props);
  let domProps = useFocsuableContext(domRef);

  useEffect(() => {
    if (props.autoFocus && domRef && domRef.current) {
      domRef.current.focus();
    }
  }, [props.autoFocus, domRef]);

  return {
    focusableProps: mergeProps(mergeProps(focusProps, keyboardProps), domProps)
  };
}
