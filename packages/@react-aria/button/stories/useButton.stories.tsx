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
import React, {useRef} from 'react';
import {storiesOf} from '@storybook/react';
import {useButton} from '../';

storiesOf('useButton', module)
  .add(
    'input type button',
    () => <InputButton />
  );

interface InputButtonProps extends AriaButtonProps<'input'> {
  value?: string
}

function InputButton(props: InputButtonProps) {
  let {
    value = 'Test'
  } = props;

  let ref = useRef();
  let {buttonProps, isPressed} = useButton({...props, elementType: 'input'}, ref);

  return (
    <input ref={ref} value={value} style={{background: isPressed ? 'darkred' : 'red'}} {...buttonProps} />
  );
}
