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
  variant, // Either undef or 'overBackground', 'positive', 'warning', 'critical'
  labelPosition = 'left', // 'left', 'top', 'bottom'
  isIndeterminate = false,
  label,
  className,
  id = createId(),
  min = 0,
  max = 100,
  ...otherProps
}) {
  let fillProps = {};
  let ariaValueProps = {};
  const sizeClassPart = SIZES[size];
  value = Math.min(Math.max(+value, min), max);
  let percentage = 100 * value / (max - min);

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

  // only add width to bar fill if determinate
  if (!isIndeterminate) {
    fillProps = {
      style: {
        width: `${percentage}%`
      }
    };
    ariaValueProps = {
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-valuenow': value,
      'aria-valuetext': `${Math.round(percentage * 10) / 10}%`
    };
  }

  return (
    <div
      className={
        classNames(
          'spectrum-BarLoader',
          `spectrum-BarLoader--${sizeClassPart}`,
          {
            'spectrum-BarLoader--indeterminate': isIndeterminate,
            'spectrum-BarLoader--sideLabel': labelPosition === 'left',
            'spectrum-BarLoader--overBackground': variant === 'overBackground',
            'is-positive': variant === 'positive',
            'is-warning': variant === 'warning',
            'is-critical': variant === 'critical'
          },
          className
        )
      }
      role="progressbar"
      {...ariaValueProps}
      aria-labelledby={ariaLabelledby}
      id={id}
      {...filterDOMProps(otherProps)}>
      {label &&
        <div className="spectrum-BarLoader-label" id={labelId}>{label}</div>
      }
      {showPercent &&
        <div className="spectrum-BarLoader-percentage">{`${Math.round(percentage)}%`}</div>
      }
      <div className="spectrum-BarLoader-track">
        <div
          className="spectrum-BarLoader-fill"
          {...fillProps} />
      </div>
    </div>
  );
}

Progress.propTypes = {
  /**
  * Value between the min and max that specifies the progression of the progress bar.
  * Calculated percentage is automatically clamped to 0-100.
  */
  value: PropTypes.number,

  /**
  * Minimum value for the progress bar. Defaults to 0.
  */
  min: PropTypes.number,

  /**
  * Maximum value for the progress bar. Defaults to 100.
  */
  max: PropTypes.number,

  /**
  * Size of the Progress component. Limited to small (S) or medium (M).
  */
  size: PropTypes.oneOf(['S', 'M']),

  /**
  * Whether to show a percentage for the progress bar's current value
  */
  showPercent: PropTypes.bool,

  /**
   * Boolean to determine if the Progress component should endlessly scroll (indeterminate)
   */
  isIndeterminate: PropTypes.bool,

  /**
  * What type of progress bar to show: 'positive' (green), 'warning' (orange), 'critical' (red)
  */
  variant: PropTypes.oneOf(['positive', 'warning', 'critical', 'overBackground']),

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
