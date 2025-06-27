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

import {PlacementAxis} from '@react-types/overlays';
import React, {HTMLAttributes} from 'react';
import {RefObject, StyleProps} from '@react-types/shared';
import {TooltipTriggerState} from '@react-stately/tooltip';

interface TooltipContextProps extends StyleProps {
  state?: TooltipTriggerState,
  ref?: RefObject<HTMLDivElement | null>,
  placement: PlacementAxis | null,
  arrowProps?: HTMLAttributes<HTMLElement>,
  arrowRef?: RefObject<HTMLElement | null>
}

export const TooltipContext = React.createContext<TooltipContextProps>({placement: null});
