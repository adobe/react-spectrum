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
import ChevronLeft from '@spectrum-icons/workflow/ChevronLeft';
import ChevronRight from '@spectrum-icons/workflow/ChevronRight';
import {classNames} from '../utils/classNames';
import {ClearSlots, SlotProvider} from '../utils/Slots';
import {DOMAttributes, Node} from '@react-types/shared';
import {FocusRing} from 'react-aria/FocusRing';
import {Grid} from '../layout/Grid';
import InfoOutline from '@spectrum-icons/workflow/InfoOutline';
// @ts-ignore
import intlMessages from '../../intl/menu/*.json';
import {mergeRefs} from 'react-aria/mergeRefs';
import React, {JSX, useMemo, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {Text} from '../text/Text';
import {TreeState} from 'react-stately/useTreeState';
import {useLocale} from 'react-aria/I18nProvider';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useMenuContext, useSubmenuTriggerContext} from './context';
import {useMenuItem} from 'react-aria/useMenu';
import {useObjectRef} from 'react-aria/useObjectRef';
import {useSlotId} from 'react-aria/private/utils/useId';

interface MenuItemProps<T> {
  item: Node<T>;
  state: TreeState<T>;
  isVirtualized?: boolean;
}

/** @private */
export function MenuItem<T>(props: MenuItemProps<T>): JSX.Element {
  let {item, state, isVirtualized} = props;
  let {closeOnSelect} = useMenuContext();
  let {rendered, key} = item;

  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/menu');
  let {direction} = useLocale();

  let submenuTriggerContext = useSubmenuTriggerContext();
  let {triggerRef, ...submenuTriggerProps} = submenuTriggerContext || {};
  let isSubmenuTrigger = !!submenuTriggerContext;
  let isUnavailable;
  let ElementType: React.ElementType = item.props.href ? 'a' : 'div';

  if (isSubmenuTrigger) {
    isUnavailable = submenuTriggerContext!.isUnavailable;
  }

  let isDisabled = state.disabledKeys.has(key);
  let isContextualHelpTrigger = isSubmenuTrigger && isUnavailable !== undefined;
  let isSelectable =
    (isContextualHelpTrigger ? !isUnavailable : !isSubmenuTrigger) &&
    state.selectionManager.selectionMode !== 'none';
  let isSelected = isSelectable && state.selectionManager.isSelected(key);
  let itemref = useRef<any>(null);
  let ref = useObjectRef(useMemo(() => mergeRefs(itemref, triggerRef), [itemref, triggerRef]));
  let {menuItemProps, labelProps, descriptionProps, keyboardShortcutProps} = useMenuItem(
    {
      isSelected,
      isDisabled,
      'aria-label': item['aria-label'],
      key,
      closeOnSelect,
      isVirtualized,
      ...submenuTriggerProps
    },
    state,
    ref
  );
  let endId = useSlotId();
  let endProps: DOMAttributes = {};
  if (endId) {
    endProps.id = endId;
    menuItemProps['aria-describedby'] = [menuItemProps['aria-describedby'], endId]
      .filter(Boolean)
      .join(' ');
  }

  let contents = typeof rendered === 'string' ? <Text>{rendered}</Text> : rendered;

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <ElementType
        {...menuItemProps}
        ref={ref}
        className={classNames(styles, 'spectrum-Menu-item', {
          'is-disabled': isDisabled,
          'is-selected': isSelected,
          'is-selectable': isSelectable,
          'is-open': submenuTriggerProps.isOpen
        })}>
        <Grid UNSAFE_className={classNames(styles, 'spectrum-Menu-itemGrid')}>
          <ClearSlots>
            <SlotProvider
              slots={{
                text: {UNSAFE_className: styles['spectrum-Menu-itemLabel'], ...labelProps},
                end: {UNSAFE_className: styles['spectrum-Menu-end'], ...endProps},
                icon: {UNSAFE_className: styles['spectrum-Menu-icon'], size: 'S'},
                description: {
                  UNSAFE_className: styles['spectrum-Menu-description'],
                  ...descriptionProps
                },
                keyboard: {
                  UNSAFE_className: styles['spectrum-Menu-keyboard'],
                  ...keyboardShortcutProps
                },
                chevron: {UNSAFE_className: styles['spectrum-Menu-chevron'], size: 'S'}
              }}>
              {contents}
              {isSelected && (
                <CheckmarkMedium
                  slot="checkmark"
                  UNSAFE_className={classNames(styles, 'spectrum-Menu-checkmark')}
                />
              )}
              {isUnavailable && (
                <InfoOutline
                  slot="end"
                  size="XS"
                  alignSelf="center"
                  aria-label={stringFormatter.format('unavailable')}
                />
              )}
              {isUnavailable == null &&
                isSubmenuTrigger &&
                (direction === 'rtl' ? (
                  <ChevronLeft slot="chevron" />
                ) : (
                  <ChevronRight slot="chevron" />
                ))}
            </SlotProvider>
          </ClearSlots>
        </Grid>
      </ElementType>
    </FocusRing>
  );
}
