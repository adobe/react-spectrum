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
import {RefObject, useEffect} from 'react';
import {useFocus, useKeyboard} from '@react-aria/interactions';

interface FocusableProps extends FocusEvents, KeyboardEvents {
  isDisabled?: boolean,
  autoFocus?: boolean
}

export function useFocusable(props: FocusableProps, domRef?: RefObject<HTMLElement>) {
  let {focusProps} = useFocus(props);
  let {keyboardProps} = useKeyboard(props);

  useEffect(() => {
    if (props.autoFocus && domRef && domRef.current) {
      domRef.current.focus();
    }
  }, [props.autoFocus, domRef]);

  return {
    focusableProps: mergeProps(focusProps, keyboardProps)
  };
}
