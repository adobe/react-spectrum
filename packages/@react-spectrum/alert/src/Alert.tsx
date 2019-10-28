import {classNames, filterDOMProps, ICON_VARIANTS} from '@react-spectrum/utils';
import intlMessages from '../intl';
import React, {ReactNode} from 'react';
import styles from '@adobe/spectrum-css-temp/components/alert/vars.css';
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

export function Alert(props: AlertProps) {
  let {
    header,
    children,
    variant = 'info', // info, help, success, error, warning
    className,
    alt, // alt text for image icon, default is derived from variant
    ...otherProps
  } = props;

  // let AlertIcon = ICONS[variant];
  let formatMessage = useMessageFormatter(intlMessages);
  if (!alt) {
    alt = formatMessage(variant);
  }
  let Icon = ICON_VARIANTS[variant];

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
