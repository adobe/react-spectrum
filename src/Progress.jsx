import React from 'react';
import classNames from 'classnames';

export default function Progress({
  value = 0, // number between 0 - 100
  size = 'M', // 'S', "M", "L"
  showPercent = false, // Whether the label should be shown or not
  labelPosition = 'right', // 'left', 'right', 'bottom'
  label, // If not specified, a `${value}%` is used.
  indeterminate = false,
  className,
  ...otherProps
}) {
  const sizeClassPart = { S: 'small', M: 'medium', L: 'large' }[size];
  value = Math.min(Math.max(+value, 0), 100);

  if (showPercent && !label) {
    label = `${ value }%`;
  }

  return (
    <div
      className={
        classNames(
          'coral-Progress',
          `coral-Progress--${ sizeClassPart }`,
          `coral-Progress--${ label ? `${ labelPosition }Label` : 'noLabel' }`,
          {
            'coral-Progress--indeterminate': indeterminate
          },
          className
        )
      }
      aria-valuemin={ indeterminate ? null : 0 }
      aria-valuemax={ indeterminate ? null : 100 }
      aria-valuenow={ indeterminate ? null : value }
      { ...otherProps }
    >
      <div className="coral-Progress-bar">
        <div
          className="coral-Progress-status"
          style={ { width: `${ indeterminate ? 0 : value }%` } }
        />
      </div>
      {
        label &&
          <div className="coral-Progress-label">
            { label }
          </div>
      }
    </div>
  );
}

Progress.displayName = 'Progress';
