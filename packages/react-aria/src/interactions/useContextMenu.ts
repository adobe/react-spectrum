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

import {HTMLAttributes, useRef} from 'react';
import {isIOS, isMac} from '../utils/platform';
import {mergeProps} from '../utils/mergeProps';
import {useLongPress} from './useLongPress';

export interface ContextMenuEvent {
  /** The target element on which the event was triggered. */
  target: Element;
  /** X position relative to the target. */
  x: number;
  /** Y position relative to the target. */
  y: number;
}

export interface ContextMenuProps {
  /** Event that is called when a context menu is triggered. */
  onContextMenu?: (e: ContextMenuEvent) => void;
}

export interface ContextMenuAria {
  /** Props to spread on the target element. */
  contextMenuProps: HTMLAttributes<HTMLElement>;
}

/**
 * Handles context menu events across mouse, touch, keyboard, and screen reader interactions.
 */
export function useContextMenu(props: ContextMenuProps): ContextMenuAria {
  // How to trigger context menu events on various platforms:
  // - macOS
  //   - Mouse right click
  //   - Control + click
  //   - Control + Enter (does not fire the contextmenu event in certain WebKit / Chrome versions - https://bugs.webkit.org/show_bug.cgi?id=302049, https://issues.chromium.org/issues/369897039)
  //   - Control + Option + Shift + M with VoiceOver
  // - Windows / Linux
  //   - Mouse right click
  //   - Shift + F10
  //   - Long press on a touch screen
  // - iOS
  //   - Long press (does not fire contextmenu event - https://bugs.webkit.org/show_bug.cgi?id=213953)
  // - Android
  //   - Long press

  let {onContextMenu} = props;
  let firedContextMenuEvent = useRef(false);

  // iOS does not fire the contextmenu event, so use long press.
  let {longPressProps} = useLongPress({
    onLongPressStart() {
      firedContextMenuEvent.current = false;
    },
    onLongPress(e) {
      if (!firedContextMenuEvent.current) {
        onContextMenu?.({target: e.target, x: e.x, y: e.y});
      } else {
        firedContextMenuEvent.current = false;
      }
    }
  });

  if (!onContextMenu) {
    return {
      contextMenuProps: {}
    };
  }

  return {
    contextMenuProps: mergeProps(isIOS() ? longPressProps : {}, {
      onContextMenu(e) {
        e.stopPropagation();
        e.preventDefault();
        firedContextMenuEvent.current = true;

        let rect = e.currentTarget.getBoundingClientRect();
        onContextMenu({
          target: e.currentTarget,
          x: e.clientX - rect.x,
          y: e.clientY - rect.y
        });
      },
      onKeyDown(e) {
        // macOS has a default keyboard shortcut to show the contextmenu: Ctrl + Enter.
        // However, some versions of Safari and Chrome do not trigger the contextmenu event.
        // Fixed in https://github.com/WebKit/WebKit/pull/62278 (currently in WekKit nightly) and
        // https://github.com/chromium/chromium/commit/268c876c191cd4712c2d1043aab9760fb71d9be5 (Chrome 147).
        // Remove this workaround once those are broadly available.
        // An additional bug still occurs when the target has a border-radius: https://bugs.webkit.org/show_bug.cgi?id=317496
        if (isMac()) {
          if (e.ctrlKey && e.key === 'Enter') {
            firedContextMenuEvent.current = false;
            let target = e.currentTarget;
            e.stopPropagation();
            setTimeout(() => {
              if (!firedContextMenuEvent.current) {
                let rect = target.getBoundingClientRect();
                onContextMenu({
                  target,
                  x: rect.width / 2,
                  y: rect.height / 2
                });
              } else {
                firedContextMenuEvent.current = false;
              }
            }, 10);
          }
        }
      }
    } satisfies HTMLAttributes<HTMLElement>)
  };
}
