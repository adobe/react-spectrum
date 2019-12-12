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
    variant = 'info', // info, help, success, error, warning
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
      <Icon className={classNames(styles, 'spectrum-Alert-icon')} alt={iconAlt} />
      <div className={classNames(styles, 'spectrum-Alert-header')}>{title}</div>
      <div className={classNames(styles, 'spectrum-Alert-content')}>{children}</div>
    </div>
  );
}
