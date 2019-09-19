import AlertMedium from '@spectrum-icons/ui/AlertMedium';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import HelpMedium from '@spectrum-icons/ui/HelpMedium';
import InfoMedium from '@spectrum-icons/ui/InfoMedium';
import intlMessages from '../intl';
import React, {ReactNode} from 'react';
import styles from '@spectrum-css/alert/dist/index-vars.css';
import SuccessMedium from '@spectrum-icons/ui/SuccessMedium';
import {useMessageFormatter} from '@react-aria/i18n';


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

export function Alert({
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
  let Icon = ICONS[variant];

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
      <Icon className={classNames(styles, 'spectrum-Alert-icon')} alt={alt} />
      <div className={classNames(styles, 'spectrum-Alert-header')}>{header}</div>
      <div className={classNames(styles, 'spectrum-Alert-content')}>{children}</div>
    </div>
  );
}
