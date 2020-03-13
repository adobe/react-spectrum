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

import {DOMProps, MultipleSelection, StyleProps} from '@react-types/shared';
import {ReactElement} from 'react';
import {SpectrumActionButtonProps} from '@react-types/button';

export type ActionGroupButton = ReactElement<SpectrumActionButtonProps>;

export interface ActionGroupProps extends DOMProps, StyleProps, MultipleSelection {
  orientation?: 'horizontal' | 'vertical',
  children: ActionGroupButton | ActionGroupButton[],
  isDisabled?: boolean
}

export interface SpectrumActionGroupProps extends ActionGroupProps {
  isEmphasized?: boolean,
  isConnected?: boolean
  isJustified?: boolean,
  isQuiet?: boolean,
  holdAffordance?: boolean,
  onSelectionChange?: (...args) => void
}
