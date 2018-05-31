import classNames from 'classnames';
import React from 'react';
import SwitchBase from './SwitchBase';

importSpectrumCSS('toggle');

export default function Switch({
  variant, // 'ab'
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
            [`spectrum-ToggleSwitch--${variant}`]: variant
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
