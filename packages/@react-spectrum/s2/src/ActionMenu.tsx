/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionButton, ActionButtonProps} from './ActionButton';
import {AriaLabelingProps, DOMProps, FocusableRef, FocusableRefValue} from '@react-types/shared';
import {ContextValue} from 'react-aria-components';
import {createContext, forwardRef} from 'react';
import {filterDOMProps} from '@react-aria/utils';
import {forwardRefType} from './types';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {Menu, MenuProps, MenuTrigger, MenuTriggerProps} from './Menu';
import MoreIcon from '../s2wf-icons/S2_Icon_More_20_N.svg';
import {StyleProps} from './style-utils' with { type: 'macro' };
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface ActionMenuProps<T> extends
  Pick<MenuTriggerProps, 'isOpen' | 'defaultOpen' | 'onOpenChange' | 'align' | 'direction' | 'shouldFlip'>,
  Pick<MenuProps<T>, 'children' | 'items' | 'disabledKeys' | 'onAction' | 'size'>,
  Pick<ActionButtonProps, 'isDisabled' | 'isQuiet' | 'autoFocus'>,
  StyleProps, DOMProps, AriaLabelingProps {
  }

export const ActionMenuContext = createContext<ContextValue<ActionMenuProps<any>, FocusableRefValue<HTMLButtonElement>>>(null);

function ActionMenu<T extends object>(props: ActionMenuProps<T>, ref: FocusableRef<HTMLButtonElement>) {
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  [props, ref] = useSpectrumContextProps(props, ref, ActionMenuContext);
  let buttonProps = filterDOMProps(props, {labelable: true});
  if (buttonProps['aria-label'] === undefined) {
    buttonProps['aria-label'] = stringFormatter.format('menu.moreActions');
  }

  // size independently controlled?
  return (
    <MenuTrigger
      isOpen={props.isOpen}
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
      align={props.align}
      direction={props.direction}
      shouldFlip={props.shouldFlip}>
      <ActionButton
        ref={ref}
        aria-label="Help"
        size={props.size}
        isDisabled={props.isDisabled}
        autoFocus={props.autoFocus}
        isQuiet={props.isQuiet}
        {...buttonProps}>
        <MoreIcon />
      </ActionButton>
      <Menu
        items={props.items}
        disabledKeys={props.disabledKeys}
        onAction={props.onAction}
        size={props.size}>
        {/* @ts-ignore TODO: fix type, right now this component is the same as Menu */}
        {props.children}
      </Menu>
    </MenuTrigger>
  );
}

/**
 * ActionMenu combines an ActionButton with a Menu for simple "more actions" use cases.
 */
let _ActionMenu = /*#__PURE__*/(forwardRef as forwardRefType)(ActionMenu);
export {_ActionMenu as ActionMenu};
