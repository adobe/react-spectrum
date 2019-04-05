import {classNames} from '@react-spectrum/utils/src/classNames';
import filterDOMProps from '@react-spectrum/utils/src/filterDOMProps';
import intlMessages from '../intl/*.json';
import {useMessageFormatter} from '@react-aria/i18n';
import styles from '@adobe/spectrum-css-temp/components/alert/vars.css';
import React from 'react';

// TODO replace
import AlertIcon from '@react/react-spectrum/Icon/core/AlertMedium';

export function Alert({
  header,
  children,
  variant = 'info', // info, help, success, error, warning
  className,
  alt, // alt text for image icon, default is derived from variant
  ...otherProps
}) {
  // let AlertIcon = ICONS[variant];
  let formatMessage = useMessageFormatter(intlMessages);
  if (!alt) {
    alt = formatMessage(variant);
  }

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
      <AlertIcon size={null} className={classNames(styles, 'spectrum-Alert-icon')} alt={alt} />
      <div className={classNames(styles, 'spectrum-Alert-header')}>{header}</div>
      <div className={classNames(styles, 'spectrum-Alert-content')}>{children}</div>
    </div>
  );
}
