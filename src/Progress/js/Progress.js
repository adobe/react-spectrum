import classNames from 'classnames';
import createId from '../../utils/createId';
import filterDOMProps from '../../utils/filterDOMProps';
import React from 'react';

importSpectrumCSS('loader');

const SIZES = {
  S: 'small',
  M: 'medium'
};

export default function Progress({
  value = 0, // number between 0 - 100
  size = 'M', // 'S', 'M'
  showPercent = false, // Whether the label should be shown or not
  labelPosition = 'left', // 'left', 'top', 'bottom'
  label,
  className,
  id = createId(),
  ...otherProps
}) {
  const sizeClassPart = SIZES[size];
  value = Math.min(Math.max(+value, 0), 100);

  let labelId;

  let ariaLabelledby = [];

  if (otherProps['aria-labelledby']) {
    ariaLabelledby.push(otherProps['aria-labelledby']);
    delete otherProps['aria-labelledby'];
  }

  if (label) {
    labelId = createId() + '-label';
    ariaLabelledby.push(labelId);
  }

  if (otherProps['aria-label']) {
    ariaLabelledby.length > 0 && ariaLabelledby.push(id);
  }

  ariaLabelledby = ariaLabelledby.length ? ariaLabelledby.join(' ') : null;

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
      aria-labelledby={ariaLabelledby}
      id={id}
      {...filterDOMProps(otherProps)}>
      {label &&
        <div className="spectrum-Loader--bar-label" id={labelId}>{label}</div>
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
