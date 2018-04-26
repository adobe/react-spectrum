import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import React from 'react';
import '../style/index.styl';

const SIZES = {
  S: 'small',
  M: 'medium'
};

export default function Progress({
  value = 0, // number between 0 - 100
  size = 'M', // 'S', 'M'
  showPercent = false, // Whether the label should be shown or not
  labelPosition = 'left', // 'left', 'bottom'
  label,
  className,
  ...otherProps
}) {
  const sizeClassPart = SIZES[size];
  value = Math.min(Math.max(+value, 0), 100);

  return (
    <div
      className={
        classNames(
          'spectrum-Loader--bar',
          `spectrum-Loader--bar--${sizeClassPart}`,
          {
            'spectrum-Loader--side-label': labelPosition === 'left'
          },
          className
        )
      }
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      {...filterDOMProps(otherProps)}>
      {label &&
        <div className="spectrum-Loader--bar-label">{label}</div>
      }
      {showPercent &&
        <div className="spectrum-Loader--bar-percentage">{value + '%'}</div>
      }
      <div className="spectrum-Loader--bar-track">
        <div
          className="spectrum-Loader--bar-fill"
          style={{width: `${value}%`}} />
      </div>
    </div>
  );
}

Progress.displayName = 'Progress';
