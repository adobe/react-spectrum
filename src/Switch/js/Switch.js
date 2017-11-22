import classNames from 'classnames';
import React from 'react';
import SwitchBase from './SwitchBase';
import '../style/index.styl';

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
      markClassName="spectrum-ToggleSwitch-content"
      labelClassName="spectrum-ToggleSwitch-label"
      {...otherProps} />
  );
}

Switch.displayName = 'Switch';
