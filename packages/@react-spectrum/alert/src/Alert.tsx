import AlertMedium from '@spectrum-icons/ui/AlertMedium';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {DOMProps} from '@react-types/shared';
import HelpMedium from '@spectrum-icons/ui/HelpMedium';
import InfoMedium from '@spectrum-icons/ui/InfoMedium';
import intlMessages from '../intl';
import React, {ReactNode} from 'react';
import {StyleProps, useStyleProps} from '@react-spectrum/view';
import styles from '@adobe/spectrum-css-temp/components/alert/vars.css';
import SuccessMedium from '@spectrum-icons/ui/SuccessMedium';
import {useMessageFormatter} from '@react-aria/i18n';

interface AlertProps extends DOMProps, StyleProps {
  header?: ReactNode,
  children: ReactNode,
  variant: 'info' | 'help' | 'success' | 'error' | 'warning',
  alt: string
}

let ICONS = {
  error: AlertMedium,
  warning: AlertMedium,
  info: InfoMedium,
  help: HelpMedium,
  success: SuccessMedium
};

export function Alert(props: AlertProps) {
  let {
    header,
    children,
    variant = 'info', // info, help, success, error, warning
    alt, // alt text for image icon, default is derived from variant
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);

  // let AlertIcon = ICONS[variant];
  let formatMessage = useMessageFormatter(intlMessages);
  if (!alt) {
    alt = formatMessage(variant);
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
      <Icon className={classNames(styles, 'spectrum-Alert-icon')} alt={alt} />
      <div className={classNames(styles, 'spectrum-Alert-header')}>{header}</div>
      <div className={classNames(styles, 'spectrum-Alert-content')}>{children}</div>
    </div>
  );
}
