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
import React, {ReactElement} from 'react';
import {SpectrumActionBarProps} from '@react-types/actionbar';
import styles from './actionbar.css';
import {Text} from '@react-spectrum/text';
import {useMessageFormatter} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

function ActionBar<T extends object>(props: SpectrumActionBarProps<T>, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);

  let {
    children,
    isEmphasized,
    onAction,
    onClearSelection,
    selectedItemCount
  } = props;

  let innerDivRef = React.useRef<HTMLDivElement>();
  let height = innerDivRef.current?.clientHeight;
  let {styleProps} = useStyleProps(selectedItemCount !== 0 ? {...props, height} : props);
  let domRef = useDOMRef(ref);
  let formatMessage = useMessageFormatter(intlMessages);

  return (
    <div
      {...filterDOMProps(props)}
      {...styleProps}
      ref={domRef}
      className={classNames(
        styles,
        'react-spectrum-ActionBar', {
          'react-spectrum-ActionBar--emphasized': isEmphasized
        },
        styleProps.className
      )}>
      <div ref={innerDivRef}>
        <div className={classNames(styles, 'react-spectrum-ActionBar__leading')}>
          <ActionButton
            aria-label={formatMessage('deselect')}
            onPress={() => onClearSelection()}
            isQuiet>
            <CrossLarge />
          </ActionButton>
          <Text>{
            selectedItemCount === 'all'
            ? formatMessage('selectedAll')
            : formatMessage('selected', {count: selectedItemCount})
          }</Text>
        </div>
        <ActionGroup selectionMode="none" onAction={onAction}>
          {children}
        </ActionGroup>
      </div>
    </div>
  );
}

/**
 * TODO: Add description of component here.
 */
const _ActionBar = React.forwardRef(ActionBar) as <T>(props: SpectrumActionBarProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;
export {_ActionBar as ActionBar};
