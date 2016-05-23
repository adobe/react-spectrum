import React, { Component } from 'react';
import classNames from 'classnames';

import SwitchBase from './internal/SwitchBase';

export default ({
  className,
  ...otherProps
}) => (
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
    { ...otherProps }
  />
);
