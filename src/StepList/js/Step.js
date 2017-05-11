import classNames from 'classnames';
import OverlayTrigger from '../../OverlayTrigger';
import React from 'react';
import Tooltip from '../../Tooltip';

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
      className={classNames(
        className,
        'coral-Step',
        {'is-complete': complete},
        {'is-selected': selected}
      )}
      role="tab"
      aria-selected={selected}
      {...otherProps}>
        <div className="coral-Step-label">
          {(size !== SMALL) && children}
        </div>
        <span className="coral-Step-markerContainer">
          {(size === SMALL) ?
            <OverlayTrigger placement="top">
              <span className="coral-Step-marker" />
              <Tooltip open>
                  {children}
              </Tooltip>
            </OverlayTrigger>
          : <span className="coral-Step-marker" />}
        </span>
        <span className="coral-Step-line" />
    </div>
  );
}

Step.displayName = 'Step';
