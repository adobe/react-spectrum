import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import React from 'react';

importSpectrumCSS('rule');

export default function Rule({className, ...otherProps}) {
  return (
    <hr
      {...filterDOMProps(otherProps)}
      className={classNames('spectrum-Rule', className)} />
  );
}
