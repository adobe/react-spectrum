import AlertMedium from '@spectrum/spectrum-iconstore/icons/react/core/AlertMedium';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import HelpMedium from '@spectrum/spectrum-iconstore/icons/react/core/HelpMedium';
import InfoMedium from '@spectrum/spectrum-iconstore/icons/react/core/InfoMedium';
import SuccessMedium from '@spectrum/spectrum-iconstore/icons/react/core/SuccessMedium';
import intlMessages from '../intl';
import {Icon} from './Icon';
import React, {ReactNode} from 'react';
import styles from '@adobe/spectrum-css-temp/components/alert/vars.css';
import {useMessageFormatter} from '@react-aria/i18n';
import {useProvider} from '@react-spectrum/provider';


interface AlertProps {
  /**
   * Any renderable item.
   */
  header?: ReactNode,
  children: ReactNode,
  variant: 'info' | 'help' | 'success' | 'error' | 'warning',
  className: string,
  alt: string,
}

let ICONS = {
  error: AlertMedium,
  warning: AlertMedium,
  info: InfoMedium,
  help: HelpMedium,
  success: SuccessMedium
};
let ICON_NAMES = {
  error: 'AlertMedium',
  warning: 'AlertMedium',
  info: 'InfoMedium',
  help: 'HelpMedium',
  success: 'SuccessMedium'
};

export function Alert ({
  header,
  children,
  variant = 'info', // info, help, success, error, warning
  className,
  alt, // alt text for image icon, default is derived from variant
  ...otherProps
}: AlertProps) {
  // let AlertIcon = ICONS[variant];
  let formatMessage = useMessageFormatter(intlMessages);
  if (!alt) {
    alt = formatMessage(variant);
  }
  let icon = ICONS[variant];

  return (
    <div
      className={
        classNames(
          styles,
          'spectrum-Alert',
          `spectrum-Alert--${variant}`,
          className
        )
      }
      role="alert"
      {...filterDOMProps(otherProps)}>
      <Icon className={classNames(styles, 'spectrum-Alert-icon')} elementName={ICON_NAMES[variant]} elementType={icon} alt={alt} />
      <div className={classNames(styles, 'spectrum-Alert-header')}>{header}</div>
      <div className={classNames(styles, 'spectrum-Alert-content')}>{children}</div>
    </div>
  );
};
