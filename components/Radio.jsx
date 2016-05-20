import React, { Component } from 'react';
import classNames from 'classnames';

import SwitchBase from './internal/SwitchBase';

export default (props) => (
  <SwitchBase
    inputType="radio"
    elementName="Radio"
    { ...props }
  />
);
