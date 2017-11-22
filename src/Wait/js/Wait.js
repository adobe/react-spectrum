import classNames from 'classnames';
import React from 'react';
import '../style/index.styl';

export default function Wait({
  size = 'M',
  centered = false,
  className,
  ...otherProps
}) {
  return (
    <div
      className={
        classNames(
          'spectrum-Loader',
          'spectrum-Loader--indeterminate',
          {
            'spectrum-Loader--indeterminate--small': size === 'S',
            'spectrum-Loader--indeterminate--large': size === 'L',
            'spectrum-Loader--centered': centered
          },
          className
        )
      }
      {...otherProps} />
  );
}

Wait.displayName = 'Wait';
