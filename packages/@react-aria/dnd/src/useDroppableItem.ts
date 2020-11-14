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

import {HTMLAttributes, useLayoutEffect} from 'react';
import * as DragManager from './DragManager';
import {useId} from '@react-aria/utils';
import {useInteractionModality} from '@react-aria/interactions';

interface DroppableItemResult {
  dropProps: HTMLAttributes<HTMLElement>
}

const MESSAGES = {
  keyboard: 'Press Enter to drop. Press Escape to cancel drag.',
  touch: 'Double tap to drop.',
  virtual: 'Click to drop.'
};

export function useDroppableItem(): DroppableItemResult {
  let descriptionId = useId();
  let modality: string = useInteractionModality() || 'virtual';
  if (modality === 'pointer') {
    modality = 'virtual';
  }

  if (modality === 'virtual' && 'ontouchstart' in window) {
    modality = 'touch';
  }

  let isKeyboardDragging = DragManager.useIsDragging();

  useLayoutEffect(() => {
    if (!isKeyboardDragging) {
      return;
    }

    let description = document.createElement('div');
    description.id = descriptionId;
    description.style.display = 'none';
    description.textContent = MESSAGES[modality];
    document.body.appendChild(description);
    return () => {
      description.remove();
    };
  }, [modality, descriptionId, isKeyboardDragging]);

  return {
    dropProps: {
      'aria-describedby': isKeyboardDragging ? descriptionId : undefined,
      // Mobile Safari does not properly bubble click events on elements except links or inputs
      // unless there is an onclick handler bound directly to the element itself. By adding this
      // handler, React will take care of adding that for us, and we are able to handle document
      // level click events in the DragManager.
      // See https://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
      onClick: () => {}
    }
  };
}
