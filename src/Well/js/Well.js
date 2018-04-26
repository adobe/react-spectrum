import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import React from 'react';
import '../style/index.styl';

export default function Well({
  children,
  className,
  ...otherProps
}) {
  return (
    <div
      className={
        classNames(
          'spectrum-Well',
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      {children}
    </div>
  );
}

Well.displayName = 'Well';
