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

import {
  classNames,
  SlotProvider, useDOMRef,
  useSlotProps
} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {Toolbar as RACToolbar} from 'react-aria-components';
import React, {forwardRef, ReactElement, useMemo} from 'react';
import {SpectrumToolbarProps} from '@react-types/actiongroup';
import styles from '@adobe/spectrum-css-temp/components/actiongroup/vars.css';
import {useProviderProps} from '@react-spectrum/provider';

function Toolbar(props: SpectrumToolbarProps, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  props = useSlotProps(props, 'toolbar');
  let {
    orientation = 'horizontal'
  } = props;
  let domRef = useDOMRef(ref);

  let slots = useMemo(() => ({
    actionGroup: {orientation},
    divider: {orientation: orientation === 'horizontal' ? 'vertical' : 'horizontal', size: 'S'}
  }), [orientation]);
  return (
    <RACToolbar
      {...props}
      ref={domRef}
      className={
        classNames(
          styles,
          'spectrum-Toolbar'
        )}>
      <SlotProvider slots={slots}>
        {props.children}
      </SlotProvider>
    </RACToolbar>
  );
}

/**
 * A Toolbar is a set of ActionGroups that are related to one another.
 */
const _Toolbar = forwardRef(Toolbar) as (props: SpectrumToolbarProps & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;
export {_Toolbar as Toolbar};
