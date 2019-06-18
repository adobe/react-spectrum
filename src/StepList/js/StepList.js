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
import PropTypes from 'prop-types';
import React from 'react';
import TabListBase from '../../TabList/js/TabListBase';

importSpectrumCSS('steplist');

const SMALL = 'S';
const LARGE = 'L';
const ON = 'on';

export default function StepList({
  className,
  interaction = ON,
  size = LARGE,
  ...otherProps
}) {
  return (
    <TabListBase
      {...otherProps}
      className={
        classNames(
          'spectrum-Steplist',
          {
            'spectrum-Steplist--interactive': interaction === ON,
            'spectrum-Steplist--small': size === SMALL
          },
          className
        )
      }
      disabled={interaction !== ON}
      aria-multiselectable={false}
      childMappingFunction={(...args) => getChildProps(size, ...args)} />
  );
}

function getChildProps(size, tabList, child, index) {
  return {
    complete: +tabList.state.selectedIndex > index,
    size
  };
}

StepList.displayName = 'StepList';

StepList.propTypes = {
  /** Class to add to the step list */
  className: PropTypes.string,
  
  /** Index of the selected step (uncontrolled state) */
  defaultSelectedIndex: PropTypes.number,
  
  /** Turn step list interaction (clickable to progress) on or off */
  interaction: PropTypes.oneOf([ON, 'off']),
  
  /** Index of the selected step */
  selectedIndex: PropTypes.number,
  
  /** Size of the steps and step list */
  size: PropTypes.oneOf(['S', 'L'])
};

StepList.defaultProps = {
  interaction: ON,
  size: LARGE
};
