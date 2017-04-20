import React from 'react';
import classNames from 'classnames';

import SwitchBase from './SwitchBase';

import '../style/index.styl';

export default function Switch({
  className,
  ...otherProps
}) {
  return (
    <SwitchBase
      inputType="checkbox"
      className={
        classNames(
          'coral3-Switch',
          className
        )
      }
      inputClassName="coral3-Switch-input"
      markClassName="coral3-Switch-label"
      renderLabel={ false }
      { ...otherProps }
    />
  );
}

Switch.displayName = 'Switch';
