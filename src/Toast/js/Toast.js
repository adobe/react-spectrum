/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import AlertMedium from '../../Icon/core/AlertMedium';
import Button from '../../Button';
import classNames from 'classnames';
import CrossMedium from '../../Icon/core/CrossMedium';
import filterDOMProps from '../../utils/filterDOMProps';
import InfoMedium from '../../Icon/core/InfoMedium';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import PropTypes from 'prop-types';
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
  onAction,
  className,
  timeout,
  actionLabel,
  closeOnAction,
  ...otherProps
}) {
  let Icon = ICONS[variant];
  let role = otherProps.role || DEFAULT_ROLE;

  const handleAction = (...args) => {
    if (onAction) {
      onAction(...args);
    }

    if (closeOnAction && onClose) {
      onClose(...args);
    }
  };

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
      <div className="spectrum-Toast-body">
        <div className="spectrum-Toast-content">{children}</div>
        {actionLabel &&
          <Button label={actionLabel} quiet variant="overBackground" onClick={handleAction} />
        }
      </div>
      {closable &&
        <div className="spectrum-Toast-buttons">
          {
            <button aria-label={formatMessage('close')} className="spectrum-ClearButton spectrum-ClearButton--medium spectrum-ClearButton--overBackground" onClick={onClose}>
              <CrossMedium size={null} />
            </button>
          }
        </div>
      }
    </div>
  );
}

Toast.propTypes = {
  /** Contents to be displayed in the Toast. */
  children: PropTypes.node,

  /** Variant of toast to use. */
  variant: PropTypes.oneOf(['error', 'warning', 'info', 'success']),

  /** Whether to show close button on toast. */
  closable: PropTypes.bool,

  /** Label for action button. */
  actionLabel: PropTypes.string,

  /** Should the action button close the toast? */
  closeOnAction: PropTypes.bool,

  /** Function called when toast is closed. */
  onClose: PropTypes.func,

  /** Function called when action button is clicked. */
  onAction: PropTypes.func,

  /**
   * Set the amount of time in milliseconds that the toast should persist.
   * If set to 0, the toast will remain until closed manually.
  */
  timeout: PropTypes.number
};
