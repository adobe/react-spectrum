/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

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
  size: PropTypes.oneOf(['S', 'L'])
};
