import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import React from 'react';

importSpectrumCSS('well');

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
