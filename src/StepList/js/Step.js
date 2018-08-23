import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import OverlayTrigger from '../../OverlayTrigger';
import PropTypes from 'prop-types';
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
        'spectrum-Steplist-item',
        {'is-complete': complete},
        {'is-selected': selected}
      )}
      role="tab"
      aria-selected={selected}
      {...filterDOMProps(otherProps)}>
      <div className="spectrum-Steplist-label">
        {(size !== SMALL) && children}
      </div>
      <span className="spectrum-Steplist-markerContainer">
        {(size === SMALL) ?
          <OverlayTrigger placement="top">
            <span className="spectrum-Steplist-marker" />
            <Tooltip open className="spectrum-Steplist-tooltip">
              {children}
            </Tooltip>
          </OverlayTrigger>
          : <span className="spectrum-Steplist-marker" />}
      </span>
      <span className="spectrum-Steplist-segment" />
    </div>
  );
}

Step.displayName = 'Step';

Step.propTypes = {
  /** Class to add to the step */
  className: PropTypes.string,
  
  /** Whether the current step is completed */
  complete: PropTypes.bool,
  
  /** Whether the current step is selected */
  selected: PropTypes.bool,
  
  /** Define the size of the step */
  size: PropTypes.oneOf(['S'])
};
