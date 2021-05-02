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

import {ActionButton} from '@react-spectrum/button';
import {ActionGroup} from '@react-spectrum/actiongroup';
import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import CrossLarge from '@spectrum-icons/ui/CrossLarge';
import {DOMRef} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {Provider, useProviderProps} from '@react-spectrum/provider';
import React from 'react';
import {SpectrumActionBarProps} from '@react-types/actionbar';
import styles from './actionbar.css';
import {Text} from '@react-spectrum/text';
import { useMessageFormatter } from '@react-aria/i18n';

function ActionBar(props: SpectrumActionBarProps, ref: DOMRef<HTMLDivElement>) {
  // Grabs specific props from the closest Provider (see https://react-spectrum.adobe.com/react-spectrum/Provider.html#property-groups). Remove if your component doesn't support any of the listed props.
  props = useProviderProps(props);

  const {
    children,
    isEmphasized,
    onAction,
    onClearSelection,
    selectedItemCount,
    variant,
    ...otherProps
  } = props;

  // Handles RSP specific style options, UNSAFE_style, and UNSAFE_className props (see https://react-spectrum.adobe.com/react-spectrum/styling.html#style-props)
  let {styleProps} = useStyleProps(props);
  let domRef = useDOMRef(ref);
  let providerProps = {isEmphasized};
  let formatMessage = useMessageFormatter(intlMessages);

  return (
    <div
      {...filterDOMProps(props)}
      {...styleProps}
      ref={domRef}
      className={classNames(
        styles,
        'spectrum-ActionBar', {
          'spectrum-ActionBar--primary': variant === 'primary',
          'spectrum-ActionBar--secondary': variant === 'secondary',
          'spectrum-ActionBar--warning': variant === 'warning',
          'spectrum-ActionBar--emphasized': isEmphasized
        },
        styleProps.className,
        otherProps.UNSAFE_className
      )}>
      <Provider {...providerProps}>
        <div className={classNames(styles, 'spectrum-ActionBar__leading')}>
          <ActionButton
            onPress={() => onClearSelection()}
            isQuiet>
            <CrossLarge />
          </ActionButton>
          <Text>{formatMessage('selected', {count: selectedItemCount})}</Text>
        </div>
        <ActionGroup selectionMode="none" onAction={onAction}>
          {children}
        </ActionGroup>
      </Provider>
    </div>
  );
}

/**
 * TODO: Add description of component here.
 */
const _ActionBar = React.forwardRef(ActionBar);
export {_ActionBar as ActionBar};
