import AlertError from '../../Icon/core/AlertError';
import AlertInfo from '../../Icon/core/AlertInfo';
import AlertSuccess from '../../Icon/core/AlertSuccess';
import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import React from 'react';
import ToastClose from '../../Icon/core/ToastClose';

importSpectrumCSS('toast');

const formatMessage = messageFormatter(intlMessages);

const ICONS = {
  error: AlertError,
  warning: AlertError,
  info: AlertInfo,
  success: AlertSuccess
};

const DEFAULT_ROLE = 'alert';

export default function Toast({
  variant,
  children,
  closable,
  onClose,
  className,
  timeout,
  ...otherProps
}) {
  let Icon = ICONS[variant];
  let role = otherProps.role || DEFAULT_ROLE;

  return (
    <div 
      role={role}
      className={classNames(
        'spectrum-Toast',
        {['spectrum-Toast--' + variant]: variant},
        className
      )}
      {...filterDOMProps(otherProps)}>
      {Icon && <Icon size={null} className="spectrum-Toast-typeIcon" alt={formatMessage(variant)} />}
      <div className="spectrum-Toast-content">{children}</div>
      {closable &&
        <button aria-label={formatMessage('close')} className="spectrum-Toast-closeButton" onClick={onClose}>
          <ToastClose size={null} />
        </button>
      }
    </div>
  );
}
