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

import {classNames} from '@react-spectrum/utils';
import React, {ReactElement, ReactNode, useRef} from 'react';
import toastContainerStyles from './toastContainer.css';
import {ToastState} from '@react-stately/toast';
import {useProvider} from '@react-spectrum/provider';
import {useToastRegion} from '@react-aria/toast';

interface ToastContainerProps {
  children: ReactNode,
  state: ToastState<unknown>
}

export function ToastContainer(props: ToastContainerProps): ReactElement {
  let {
    children,
    state
  } = props;
  let provider = useProvider();
  let containerPlacement = provider.scale === 'large' ? 'center' : 'right';

  let ref = useRef();
  let {regionProps} = useToastRegion({}, state, ref);

  return (
    <div
      {...regionProps}
      ref={ref}
      data-position="bottom"
      data-placement={containerPlacement}
      className={classNames(
        toastContainerStyles,
        'react-spectrum-ToastContainer'
      )}>
      {children}
    </div>
  );
}
