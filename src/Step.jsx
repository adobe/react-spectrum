import React from 'react';
import classNames from 'classnames';
import Tooltip from './Tooltip';

const SMALL = 'S';

export default function Step({
  children,
  className,
  complete,
  selected,
  size,
  ...otherProps
}) {
  return (
    <div
      className={
        classNames(
          className,
          'coral-Step',
          { 'is-complete': complete },
          { 'is-selected': selected }
        )
      }
      role="tab"
      aria-selected={ selected }
      { ...otherProps }
    >
      <div className="coral-Step-label">
        {children}
      </div>
      <span className="coral-Step-markerContainer">
        <Tooltip
          openOn={ (size === SMALL) ? 'hover' : null }
          open
          placement="top"
          content={ children }
        >
          <span className="coral-Step-marker" />
        </Tooltip>
      </span>
      <span className="coral-Step-line" />
    </div>
  );
}

Step.displayName = 'Step';
