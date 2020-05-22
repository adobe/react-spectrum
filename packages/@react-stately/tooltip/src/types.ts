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

import {TooltipManager} from './TooltipManager';

export interface TooltipState {
  /** Whether the tooltip is currently open. */
  isOpen: boolean,
  /** Sets whether the tooltip is open. */
  setOpen: (value: boolean) => void,
  /** Opens the tooltip. */
  open(): void,
  /** Closes the tooltip. */
  close(): void
}

export interface TooltipTriggerState {
  /** A tooltip manager to update multiple tooltips state. */
  tooltipManager: TooltipManager
}

export interface MultipleTooltipManager {
  openTooltip(): void,
  closeTooltip(): void,
  openTooltipDelayed(): void,
  closeTooltipDelayed(): void
}
