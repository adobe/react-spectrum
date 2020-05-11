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

import {DialogTriggerProps} from '@react-types/dialog';
import {useControlledState} from '@react-stately/utils';

export interface DialogTriggerState {
  /** Whether the dialog is currently open. */
  isOpen: boolean,
  /** Sets whether the dialog is open. */
  setOpen: (value: boolean) => void,
  /** Opens the dialog. */
  open(): void,
  /** Closes the dialog. */
  close(): void,
  /** Toggles the dialog's visibility. */
  toggle(): void
}

/**
 * Manages state for a dialog trigger. Tracks whether the dialog is open, and provides
 * methods to toggle this state.
 */
export function useDialogTriggerState(props: DialogTriggerProps): DialogTriggerState  {
  let [isOpen, setOpen] = useControlledState(props.isOpen, props.defaultOpen || false, props.onOpenChange);

  return {
    isOpen, 
    setOpen,
    open() {
      setOpen(true);
    },
    close() {
      setOpen(false);
    },
    toggle() {
      setOpen(!isOpen);
    }
  };
}
