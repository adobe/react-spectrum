import classNames from 'classnames';
import createId from '../../utils/createId';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React from 'react';

importSpectrumCSS('barloader');

const SIZES = {
  S: 'small',
  M: 'medium'
};

export default function Progress({
  value = 0, // number between 0 - 100
  size = 'M', // 'S', 'M'
  showPercent = false, // Whether the label should be shown or not
  variant, // What type of progress bar to show: 'positive', 'warning', 'critical'
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
          'spectrum-BarLoader',
          `spectrum-BarLoader--${sizeClassPart}`,
          {
            'spectrum-BarLoader--sideLabel': labelPosition === 'left',
            'is-positive': variant === 'positive',
            'is-warning': variant === 'warning',
            'is-critical': variant === 'critical'
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
        <div className="spectrum-BarLoader-label" id={labelId}>{label}</div>
      }
      {showPercent &&
        <div className="spectrum-BarLoader-percentage">{value + '%'}</div>
      }
      <div className="spectrum-BarLoader-track">
        <div
          className="spectrum-BarLoader-fill"
          style={{width: `${value}%`}} />
      </div>
    </div>
  );
}

Progress.propTypes = {
  /**
  * Value that sets the percentage progression of the progress bar.
  * Value is automatically clamped to 0-100.
  */
  value: PropTypes.number,

  /**
  * Size of the Progress component. Limited to small (S) or medium (M).
  */
  size: PropTypes.oneOf(['S', 'M']),

  /**
  * Whether to show a percentage for the progress bar's current value
  */
  showPercent: PropTypes.bool,

  /**
  * What type of progress bar to show: 'positive' (green), 'warning' (orange), 'critical' (red)
  */
  variant: PropTypes.oneOf(['positive', 'warning', 'critical']),

  /**
  * Determines the positioning of the provided label.
  * Limited to 'left', 'top', or 'bottom'
  */
  labelPosition: PropTypes.oneOf(['left', 'top', 'bottom']),

  /**
  * Determines the label for the Progress component.
  */
  label: PropTypes.string
};

Progress.displayName = 'Progress';
