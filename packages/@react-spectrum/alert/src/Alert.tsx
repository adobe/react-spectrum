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

import AlertMedium from '@spectrum-icons/ui/AlertMedium';
import {classNames, filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import HelpMedium from '@spectrum-icons/ui/HelpMedium';
import InfoMedium from '@spectrum-icons/ui/InfoMedium';
import intlMessages from '../intl';
import React from 'react';
import {SpectrumAlertProps} from '@react-types/alert';
import styles from '@adobe/spectrum-css-temp/components/alert/vars.css';
import SuccessMedium from '@spectrum-icons/ui/SuccessMedium';
import {useMessageFormatter} from '@react-aria/i18n';

let ICONS = {
  error: AlertMedium,
  warning: AlertMedium,
  info: InfoMedium,
  help: HelpMedium,
  success: SuccessMedium
};

export function Alert(props: SpectrumAlertProps) {
  let {
    title,
    children,
    variant, // info, help, success, error, warning
    iconAlt, // alt text for image icon, default is derived from variant
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);

  // let AlertIcon = ICONS[variant];
  let formatMessage = useMessageFormatter(intlMessages);
  if (!iconAlt) {
    iconAlt = formatMessage(variant);
  }
  let Icon = ICONS[variant];

  return (
    <div
      {...filterDOMProps(otherProps)}
      {...styleProps}
      className={
        classNames(
          styles,
          'spectrum-Alert',
          `spectrum-Alert--${variant}`,
          styleProps.className
        )
      }
      role="alert">
      <Icon UNSAFE_className={classNames(styles, 'spectrum-Alert-icon')} alt={iconAlt} />
      <div className={classNames(styles, 'spectrum-Alert-header')}>{title}</div>
      <div className={classNames(styles, 'spectrum-Alert-content')}>{children}</div>
    </div>
  );
}
