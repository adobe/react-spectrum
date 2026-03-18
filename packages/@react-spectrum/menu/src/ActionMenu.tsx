/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionButton} from '@react-spectrum/button';
import {AriaLabelingProps, CollectionBase, DOMProps, FocusableRef, Key, StyleProps} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {Menu} from './Menu';
import {MenuTrigger, SpectrumMenuTriggerProps} from './MenuTrigger';
import More from '@spectrum-icons/workflow/More';
import React, {forwardRef, ReactElement} from 'react';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useSlotProps} from '@react-spectrum/utils';

export interface SpectrumActionMenuProps<T> extends CollectionBase<T>, Omit<SpectrumMenuTriggerProps, 'children'>, StyleProps, DOMProps, AriaLabelingProps {
  /** Whether the button is disabled. */
  isDisabled?: boolean,
  /** Whether the button should be displayed with a [quiet style](https://spectrum.adobe.com/page/action-button/#Quiet). */
  isQuiet?: boolean,
  /** Whether the element should receive focus on render. */
  autoFocus?: boolean,
  /** Handler that is called when an item is selected. */
  onAction?: (key: Key) => void
}

/**
 * ActionMenu combines an ActionButton with a Menu for simple "more actions" use cases.
 */
export const ActionMenu = forwardRef(function ActionMenu<T extends object>(props: SpectrumActionMenuProps<T>, ref: FocusableRef<HTMLButtonElement>) {
  props = useSlotProps(props, 'actionMenu');
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/menu');
  let buttonProps = filterDOMProps(props, {labelable: true});
  if (buttonProps['aria-label'] === undefined) {
    buttonProps['aria-label'] = stringFormatter.format('moreActions');
  }

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
        {...props}
        {...buttonProps}>
        <More />
      </ActionButton>
      <Menu
        children={props.children}
        items={props.items}
        disabledKeys={props.disabledKeys}
        onAction={props.onAction} />
    </MenuTrigger>
  );
}) as <T>(props: SpectrumActionMenuProps<T> & {ref?: FocusableRef<HTMLButtonElement>}) => ReactElement;
