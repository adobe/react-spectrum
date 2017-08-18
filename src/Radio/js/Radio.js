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
          'coral-Radio',
          className
        )
      }
      inputClassName="coral-Radio-input"
      markClassName="coral-Radio-checkmark"
      labelClassName="coral-Radio-description"
      {...otherProps} />
  );
}

Radio.displayName = 'Radio';
