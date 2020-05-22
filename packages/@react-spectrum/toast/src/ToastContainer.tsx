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

import {classNames, filterDOMProps} from '@react-spectrum/utils';
import React, {ReactElement} from 'react';
import {Toast} from './';
import toastContainerStyles from './toastContainer.css';
import {ToastState} from '@react-types/toast';
// import {useProvider} from '@react-spectrum/provider';

export function ToastContainer(props: ToastState): ReactElement {
  let {
    onRemove,
    toasts,
    ...otherProps
  } = props;
  // let providerProps = useProvider();
  let toastPlacement = 'bottom'; /* providerProps && providerProps.toastPlacement && providerProps.toastPlacement.split(' '); */
  let containerPosition = toastPlacement && toastPlacement[0];
  let containerPlacement = toastPlacement && toastPlacement[1];

  let renderToasts = () => toasts.map((toast) =>
    (<Toast
      {...toast.props}
      key={toast.props.toastKey}
      onRemove={onRemove}
      timer={toast.timer}>
      {toast.content}
    </Toast>)
  );


  return (
    <div
      {...filterDOMProps(otherProps)}
      className={classNames(
        toastContainerStyles,
        'react-spectrum-ToastContainer',
        containerPosition && `react-spectrum-ToastContainer--${containerPosition}`,
        containerPlacement && `react-spectrum-ToastContainer--${containerPlacement}`
      )}>
      {renderToasts()}
    </div>
  );
}
