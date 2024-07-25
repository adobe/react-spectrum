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

import {OverlayTriggerProps} from '@react-types/overlays';
import {useCallback} from 'react';
import {useControlledState} from '@react-stately/utils';

export interface OverlayTriggerState {
  /** Whether the overlay is currently open. */
  readonly isOpen: boolean,
  /** Sets whether the overlay is open. */
  setOpen(isOpen: boolean): void,
  /** Opens the overlay. */
  open(): void,
  /** Closes the overlay. */
  close(): void,
  /** Toggles the overlay's visibility. */
  toggle(): void
}

/**
 * Manages state for an overlay trigger. Tracks whether the overlay is open, and provides
 * methods to toggle this state.
 */
export function useOverlayTriggerState(props: OverlayTriggerProps): OverlayTriggerState  {
  let [isOpen, setOpen] = useControlledState(props.isOpen, props.defaultOpen || false, props.onOpenChange);

  const open = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const toggle = useCallback(() => {
    setOpen(!isOpen);
  }, [setOpen, isOpen]);

  return {
    isOpen,
    setOpen,
    open,
    close,
    toggle
  };
}
