import classNames from 'classnames';
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
          'coral-Well',
          className
        )
      }
      {...otherProps}>
      {children}
    </div>
  );
}

Well.displayName = 'Well';
