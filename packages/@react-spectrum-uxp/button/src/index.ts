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

const isUxp = document.location.protocol === 'plugin:';

// TODO: This is not simplified or even correct yet, we've just moved it over from it's previous location within @react-spectrum/button/src
import { Button as WebButton } from '@react-spectrum/button';
import { Button as UxpButton } from './UxpButton';
export const Button: typeof WebButton = isUxp ? UxpButton : WebButton;

export * from '../ActionButton';
export * from '../FieldButton';
export * from '../LogicButton';
export * from '../ClearButton';
export * from '../ToggleButton';
