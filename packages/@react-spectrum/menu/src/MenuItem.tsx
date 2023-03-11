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

import CheckmarkMedium from '@spectrum-icons/ui/CheckmarkMedium';
import {classNames, ClearSlots, SlotProvider} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {Grid} from '@react-spectrum/layout';
import {mergeProps} from '@react-aria/utils';
import {Node} from '@react-types/shared';
import React, {Key, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {Text} from '@react-spectrum/text';
import {TreeState} from '@react-stately/tree';
import {useHover, useKeyboard} from '@react-aria/interactions';
import {useMenuContext} from './context';
import {useMenuItem} from '@react-aria/menu';
import InfoMedium from "@spectrum-icons/ui/InfoMedium";
import {useLocalizedStringFormatter} from "@react-aria/i18n";
// @ts-ignore
import intlMessages from '../intl/*.json';

interface MenuItemProps<T> {
  item: Node<T>,
  state: TreeState<T>,
  isVirtualized?: boolean,
  onAction?: (key: Key) => void
}

export let MenuItemContext = React.createContext(null);

export function useMenuItemContext() {
  return React.useContext(MenuItemContext);
}

export let MenuDialogContext = React.createContext(null);

export function useMenuDialogContext() {
  return React.useContext(MenuDialogContext);
}

/** @private */
export function MenuItem<T>(props: MenuItemProps<T>) {
  let {
    item,
    state,
    isVirtualized,
    onAction
  } = props;
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let menuDialogContext = useMenuDialogContext();
  let isMenuDialogTrigger = !!menuDialogContext;
  let isUnavailable;

  let {openKey, setOpenKey, hoveredItem, setHoveredItem, setOpenRef} = useMenuItemContext() ?? {};
  if (isMenuDialogTrigger) {
    isUnavailable = menuDialogContext.isUnavailable;
  }

  let {
    onClose,
    closeOnSelect
  } = useMenuContext();

  let {
    rendered,
    key
  } = item;

  let isSelected = state.selectionManager.isSelected(key);
  let isDisabled = state.disabledKeys.has(key);

  let ref = useRef<HTMLLIElement>();
  let {menuItemProps, labelProps, descriptionProps, keyboardShortcutProps} = useMenuItem(
    {
      isSelected,
      isDisabled,
      'aria-label': item['aria-label'],
      key,
      onClose,
      closeOnSelect,
      isVirtualized,
      onAction
    },
    state,
    ref
  );
  /**
   * order of events:
   * sub dialog is open
   *
   * hover a different menu item than the trigger
   * focus called on the different menu item
   * dialog state set to close
   * dialog's contain pulls focus back
   * dialog closes
   * focus lost to body
   * restore focus kicks in and sets focus to the trigger
   *
   * need some way to restore focus to the focused key instead of the trigger
   * can't disable restore focus because then focus is lost to the body after being pulled back to the dialog
   * can't disable contain because then it won't be a focus trap
   * can't move the focus after it's been restored because we don't know if the programmatic focus was legit and the user won't use the mouse again
   * don't want to make the FocusScope aware of collections
   */

  let {hoverProps, isHovered} = useHover({
    isDisabled,
    onHoverChange: isHovered => {
      if (isHovered && isMenuDialogTrigger) {
        setHoveredItem(key);
        setOpenRef(ref);
      } else {
        setHoveredItem(null);
      }
    }
  });

  let {keyboardProps} = useKeyboard({
    onKeyDown: (e) => {
      if (e.key === 'ArrowRight' && isMenuDialogTrigger) {
        setOpenKey(key);
        setOpenRef(ref);
      } else {
        e.continuePropagation();
      }
    }
  });

  let contents = typeof rendered === 'string'
    ? <Text>{rendered}</Text>
    : rendered;

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <li
        {...mergeProps(menuItemProps, hoverProps, keyboardProps)}
        ref={ref}
        className={classNames(
          styles,
          'spectrum-Menu-item',
          {
            'is-disabled': isDisabled,
            'is-selected': isSelected,
            'is-selectable': state.selectionManager.selectionMode !== 'none',
            'is-hovered': isHovered
          }
        )}
        aria-haspopup={isMenuDialogTrigger ? 'dialog' : undefined}
        aria-expanded={isMenuDialogTrigger ? (openKey === key ? 'true' : 'false') : undefined}>
        <Grid
          UNSAFE_className={
            classNames(
              styles,
              'spectrum-Menu-itemGrid'
            )
          }>
          <ClearSlots>
            <SlotProvider
              slots={{
                text: {UNSAFE_className: styles['spectrum-Menu-itemLabel'], ...labelProps},
                end: {UNSAFE_className: styles['spectrum-Menu-end'], ...descriptionProps},
                icon: {UNSAFE_className: styles['spectrum-Menu-icon'], size: 'S'},
                description: {UNSAFE_className: styles['spectrum-Menu-description'], ...descriptionProps},
                keyboard: {UNSAFE_className: styles['spectrum-Menu-keyboard'], ...keyboardShortcutProps}
              }}>
              {contents}
              {isSelected &&
                <CheckmarkMedium
                  slot="checkmark"
                  UNSAFE_className={
                        classNames(
                          styles,
                          'spectrum-Menu-checkmark'
                        )
                      } />
              }
              {
                isUnavailable && <InfoMedium slot="end" aria-label={stringFormatter.format('unavailable')} />
              }
            </SlotProvider>
          </ClearSlots>
        </Grid>
      </li>
    </FocusRing>
  );
}
