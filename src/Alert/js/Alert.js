import AlertMedium from '../../Icon/core/AlertMedium';
import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import HelpMedium from '../../Icon/core/HelpMedium';
import InfoMedium from '../../Icon/core/InfoMedium';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import PropTypes from 'prop-types';
import React from 'react';
import SuccessMedium from '../../Icon/core/SuccessMedium';

importSpectrumCSS('alert');

const ICONS = {
  error: AlertMedium,
  warning: AlertMedium,
  info: InfoMedium,
  help: HelpMedium,
  success: SuccessMedium
};

const formatMessage = messageFormatter(intlMessages);

export default function Alert({
  header,
  children,
  variant = 'info', // info, help, success, error, warning
  className,
  alt = formatMessage(variant || 'info'), // alt text for image icon, default is derived from variant
  ...otherProps
}) {
  let AlertIcon = ICONS[variant];

  return (
    <div
      className={
        classNames(
          'spectrum-Alert',
          `spectrum-Alert--${variant}`,
          className
        )
      }
      role="alert"
      {...filterDOMProps(otherProps)}>
      <AlertIcon size={null} className="spectrum-Alert-icon" alt={alt} />
      <div className="spectrum-Alert-header">{header}</div>
      <div className="spectrum-Alert-content">{children}</div>
    </div>
  );
}

Alert.propTypes = {
  /**
   * A string for the Header of the Alert
   */
  header: PropTypes.string,

  /**
   * Any arbitrary node to render into content area
   */
  children: PropTypes.node,

  /**
   * Affects the color and icon used by the Alert
   */
  variant: PropTypes.oneOf(['error', 'warning', 'info', 'help', 'success'])
};

Alert.displayName = 'Alert';
