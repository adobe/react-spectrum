import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import SwitchBase from './SwitchBase';

importSpectrumCSS('toggle');

export default function Switch({
  variant, // 'ab'
  quiet,
  className,
  ...otherProps
}) {
  return (
    <SwitchBase
      inputType="checkbox"
      className={
        classNames(
          'spectrum-ToggleSwitch',
          {
            [`spectrum-ToggleSwitch--${variant}`]: variant,
            'spectrum-ToggleSwitch--quiet': quiet
          },
          className
        )
      }
      inputClassName="spectrum-ToggleSwitch-input"
      markClassName="spectrum-ToggleSwitch-switch"
      labelClassName="spectrum-ToggleSwitch-label"
      role="switch"
      {...otherProps} />
  );
}

Switch.displayName = 'Switch';
Switch.propTypes = {
  /**
  * Class given to switch
  */
  className: PropTypes.string,

  /**
  * Whether the switch is checked or not (controlled state)
  */
  checked: PropTypes.bool,

  /**
  * Whether the switch should be checked (uncontrolled state)
  */
  defaultChecked: PropTypes.bool,

  /**
  * Text to add to switch
  */
  label: PropTypes.string,

  /**
  * Function called when switch is changed
  */
  onChange: PropTypes.func,

  /**
  * Whether switch is a quiet variation
  */
  quiet: PropTypes.bool,

  /**
  * Change switch to A/B variant rather an on/off
  */
  variant: PropTypes.oneOf(['ab'])

};
