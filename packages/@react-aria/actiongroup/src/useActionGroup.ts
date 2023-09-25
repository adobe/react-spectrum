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

import {AriaActionGroupProps} from '@react-types/actiongroup';
import {createFocusManager} from '@react-aria/focus';
import {DOMAttributes, FocusableElement, Orientation} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import {KeyboardEventHandler, RefObject} from 'react';
import {ListState} from '@react-stately/list';
import {useLocale} from '@react-aria/i18n';

const BUTTON_GROUP_ROLES = {
  'none': 'toolbar',
  'single': 'radiogroup',
  'multiple': 'toolbar'
};

export interface ActionGroupAria {
  actionGroupProps: DOMAttributes
}

export function useActionGroup<T>(props: AriaActionGroupProps<T>, state: ListState<T>, ref: RefObject<FocusableElement>): ActionGroupAria {
  let {
    isDisabled,
    orientation = 'horizontal' as Orientation,
    isInsideAToolbar = false
  } = props;
  let allKeys = [...state.collection.getKeys()];
  if (!allKeys.some(key => !state.disabledKeys.has(key))) {
    isDisabled = true;
  }

  let {direction} = useLocale();
  let focusManager = createFocusManager(ref);
  let flipDirection = direction === 'rtl' && orientation === 'horizontal';
  let onKeyDown: KeyboardEventHandler = (e) => {
    if (!e.currentTarget.contains(e.target as HTMLElement)) {
      return;
    }

    let next, willWrap;
    switch (e.key) {
      case 'ArrowRight':
        if (flipDirection) {
          next = focusManager.focusPrevious({wrap: true, preview: true});
          willWrap = next === focusManager.focusLast({preview: true});
          if (willWrap) {
            // delegate wrapping to a parent, such as toolbar
            queueMicrotask(() => {
              if (e.nativeEvent.defaultPrevented) {
                return;
              }
              focusManager.focusLast();
            });
            return;
          } else {
            focusManager.focusPrevious({wrap: true});
          }
        } else {
          next = focusManager.focusNext({wrap: true, preview: true});
          willWrap = next === focusManager.focusFirst({preview: true});
          if (willWrap) {
            queueMicrotask(() => {
              if (e.nativeEvent.defaultPrevented) {
                return;
              }
              focusManager.focusFirst();
            });
            return;
          } else {
            focusManager.focusNext({wrap: true});
          }
        }
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'ArrowDown':
        next = focusManager.focusNext({wrap: true, preview: true});
        willWrap = next === focusManager.focusFirst({preview: true});
        if (willWrap) {
          queueMicrotask(() => {
            if (e.nativeEvent.defaultPrevented) {
              return;
            }
            focusManager.focusFirst();
          });
          return;
        } else {
          focusManager.focusNext({wrap: true});
        }
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'ArrowLeft':
        if (flipDirection) {
          next = focusManager.focusNext({wrap: true, preview: true});
          willWrap = next === focusManager.focusFirst({preview: true});
          if (willWrap) {
            queueMicrotask(() => {
              if (e.nativeEvent.defaultPrevented) {
                return;
              }
              focusManager.focusFirst();
            });
            return;
          } else {
            focusManager.focusNext({wrap: true});
          }
        } else {
          next = focusManager.focusPrevious({wrap: true, preview: true});
          willWrap = next === focusManager.focusLast({preview: true});
          if (willWrap) {
            queueMicrotask(() => {
              if (e.nativeEvent.defaultPrevented) {
                return;
              }
              focusManager.focusLast();
            });
            return;
          } else {
            focusManager.focusPrevious({wrap: true});
          }
        }
        e.preventDefault();
        e.stopPropagation();
        break;
      case 'ArrowUp':
        next = focusManager.focusPrevious({wrap: true, preview: true});
        willWrap = next === focusManager.focusLast({preview: true});
        if (willWrap) {
          queueMicrotask(() => {
            if (e.nativeEvent.defaultPrevented) {
              return;
            }
            focusManager.focusLast();
          });
          return;
        } else {
          focusManager.focusPrevious({wrap: true});
        }
        e.preventDefault();
        e.stopPropagation();
        break;
    }
  };

  let role: string | undefined = BUTTON_GROUP_ROLES[state.selectionManager.selectionMode];
  if (isInsideAToolbar && role === 'toolbar') {
    role = 'group';
  }
  return {
    actionGroupProps: {
      ...filterDOMProps(props, {labelable: true}),
      role,
      'aria-orientation': role === 'toolbar' ? orientation : undefined,
      'aria-disabled': isDisabled,
      onKeyDown
    }
  };
}
