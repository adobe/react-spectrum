import AlertMedium from '../../Icon/core/AlertMedium';
import classNames from 'classnames';
import CrossMedium from '../../Icon/core/CrossMedium';
import filterDOMProps from '../../utils/filterDOMProps';
import InfoMedium from '../../Icon/core/InfoMedium';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import React from 'react';
import SuccessMedium from '../../Icon/core/SuccessMedium';

importSpectrumCSS('toast');

const formatMessage = messageFormatter(intlMessages);

const ICONS = {
  error: AlertMedium,
  warning: AlertMedium,
  info: InfoMedium,
  success: SuccessMedium
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
        <div className="spectrum-Toast-buttons">
          <button aria-label={formatMessage('close')} className="spectrum-ClearButton spectrum-ClearButton--medium spectrum-ClearButton--overBackground" onClick={onClose}>
            <CrossMedium size={null} />
          </button>
        </div>
      }
    </div>
  );
}
