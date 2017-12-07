import classNames from 'classnames';
import React from 'react';
import SwitchBase from '../../Switch/js/SwitchBase';
import '../style/index.styl';

export default function Radio({
  className,
  ...otherProps
}) {
  return (
    <SwitchBase
      inputType="radio"
      className={
        classNames(
          'spectrum-Radio',
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
