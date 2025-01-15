/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  Button,
  ButtonProps,
  ButtonRenderProps
} from 'react-aria-components';
import CrossIcon from '../ui-icons/Cross';
import {FocusableRef} from '@react-types/shared';
import {forwardRef} from 'react';
import {style} from '../style' with {type: 'macro'};
import {useFocusableRef} from '@react-spectrum/utils';

interface ClearButtonStyleProps {
  /**
   * The size of the ClearButton.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL'
}

interface ClearButtonRenderProps extends ButtonRenderProps, ClearButtonStyleProps {}
interface ClearButtonProps extends ButtonProps, ClearButtonStyleProps {}

export const ClearButton = forwardRef(function ClearButton(props: ClearButtonProps, ref: FocusableRef<HTMLButtonElement>) {
  let domRef = useFocusableRef(ref);

  return (
    <Button
      {...props}
      ref={domRef}
      className={renderProps => style<ClearButtonRenderProps>({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'full',
        width: 'control',
        flexShrink: 0,
        borderStyle: 'none',
        outlineStyle: 'none',
        backgroundColor: 'transparent',
        padding: 0,
        color: '[inherit]',
        '--iconPrimary': {
          type: 'fill',
          value: 'currentColor'
        }
      })({...renderProps, size: props.size || 'M'})}>
      <CrossIcon size={props.size || 'M'} />
    </Button>
  );
});
