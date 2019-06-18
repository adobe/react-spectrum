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
 * Image or file preview, displayed at the top of a card. Pass contents as children, often an Asset component.
 */
export default class CardPreview extends React.Component {
  static contextTypes = {
    cardVariant: PropTypes.string,
    onLoad: PropTypes.func,
    hasTitle: PropTypes.bool
  };

  render() {
    let child = React.Children.only(this.props.children);
    let {cardVariant, onLoad, hasTitle} = this.context;

    let smartness = 0;
    if (cardVariant === 'quiet') {
      smartness = 1;
    }

    // Default image to decorative if there is already a title in the CardBody.
    // If the child already defines the decorative prop or alt prop, don't override it.
    let decorative = hasTitle;
    if (child.props.decorative != null || child.props.alt != null) {
      decorative = child.props.decorative;
    }
    
    return (
      <div className="spectrum-Card-preview">
        {React.cloneElement(child, {
          smartness,
          onLoad,
          decorative
        })}
      </div>
    );
  }
}
