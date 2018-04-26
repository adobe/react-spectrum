import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import React from 'react';
import '../style/index.styl';

importSpectrumCSS('loader');

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
            'spectrum-Loader--small': size === 'S',
            'spectrum-Loader--large': size === 'L',
            'react-spectrum-Wait--centered': centered
          },
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      <div className="spectrum-Loader-track" />
      <div className="spectrum-Loader-fills">
        <div className="spectrum-Loader-fill-mask-1">
          <div className="spectrum-Loader-fill-submask-1">
            <div className="spectrum-Loader-fill" />
          </div>
        </div>
        <div className="spectrum-Loader-fill-mask-2">
          <div className="spectrum-Loader-fill-submask-2">
            <div className="spectrum-Loader-fill" />
          </div>
        </div>
      </div>
    </div>
  );
}

Wait.displayName = 'Wait';
