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

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import SwitchBase from '../../Switch/js/SwitchBase';

importSpectrumCSS('radio');

export default function Radio({
  className,
  labelBelow,
  quiet,
  ...otherProps
}) {
  return (
    <SwitchBase
      inputType="radio"
      className={
        classNames(
          'spectrum-Radio',
          {
            'spectrum-Radio--labelBelow': labelBelow,
            'spectrum-Radio--quiet': quiet
          },
          className
        )
      }
      inputClassName="spectrum-Radio-input"
      markClassName="spectrum-Radio-button"
      labelClassName="spectrum-Radio-label"
      {...otherProps} />
  );
}

Radio.displayName = 'Radio';
Radio.propTypes = {
  /**
   * Whether the radio should start off checked (controlled state)
   */
  checked: PropTypes.bool,

  /**
   * Class given to radio
   */
  className: PropTypes.string,

  /**
   * Whether the radio should be checked on mount
   */
  defaultChecked: PropTypes.bool,

  /**
   * Displays the invalid state of this component
   */
  invalid: PropTypes.bool,

  /**
   * Label for radio
   */
  label: PropTypes.string,

  /**
   * Whether label is below radio
   */
  labelBelow: PropTypes.bool,

  /**
   * Whether radio is a quiet variation
   */
  quiet: PropTypes.bool,

  /**
   * Whether label is rendered
   */
  renderLabel: PropTypes.bool
};
