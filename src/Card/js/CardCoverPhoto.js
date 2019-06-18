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

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Cover photo for standard variant cards. Accepts an image url, and custom children 
 * (e.g. Avatar) displayed at the bottom of the cover photo.
 */
export default class CardCoverPhoto extends React.Component {
  static propTypes = {
    /** Image url to be displayed in the cover photo */
    src: PropTypes.string
  };

  render() {
    let {src, children} = this.props;

    return (
      <div className="spectrum-Card-coverPhoto" style={{backgroundImage: `url(${JSON.stringify(src)})`}}>
        {children}
      </div>
    );
  }
}
