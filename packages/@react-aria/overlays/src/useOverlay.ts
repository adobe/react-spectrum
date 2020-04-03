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

import {ButtonHTMLAttributes, HTMLAttributes, RefObject, useEffect} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useInteractOutside} from '@react-aria/interactions';
import {useMessageFormatter} from '@react-aria/i18n';

interface OverlayProps {
  ref: RefObject<HTMLElement | null>,
  onClose?: () => void,
  isOpen?: boolean,
  // Whether to close overlay if underlay is clicked
  isDismissable?: boolean
}

interface OverlayAria {
  overlayProps: HTMLAttributes<HTMLElement>,
  dismissButtonProps: ButtonHTMLAttributes<HTMLButtonElement>
}

const visibleOverlays: RefObject<HTMLElement>[] = [];

export function useOverlay(props: OverlayProps): OverlayAria {
  let {ref, onClose, isOpen, isDismissable = false} = props;

  // Add the overlay ref to the stack of visible overlays on mount, and remove on unmount.
  useEffect(() => {
    if (isOpen) {
      visibleOverlays.push(ref);
    }

    return () => {
      let index = visibleOverlays.indexOf(ref);
      if (index >= 0) {
        visibleOverlays.splice(index, 1);
      }
    };
  }, [isOpen, ref]);

  // Only hide the overlay when it is the topmost visible overlay in the stack.
  let onHide = () => {
    if (visibleOverlays[visibleOverlays.length - 1] === ref && onClose) {
      onClose();
    }
  };

  // Handle the escape key
  let onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onHide();
    }
  };

  // Handle clicking outside the overlay to close it
  useInteractOutside({ref, onInteractOutside: isDismissable ? onHide : null});

  let formatMessage = useMessageFormatter(intlMessages);

  return {
    overlayProps: {
      onKeyDown
    },
    dismissButtonProps: isDismissable ? {
      tabIndex: -1,
      'aria-label': formatMessage('dismiss'),
      onClick() {
        onHide();
      }
    } : {}
  };
}
