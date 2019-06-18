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
import PropTypes from 'prop-types';
import React, {Component} from 'react';

importSpectrumCSS('fieldlabel');

export default class Form extends Component {
  static propTypes = {
    /**
     * Custom classname to append to the form element
     */
    className: PropTypes.string
  };

  render() {
    const {
      children,
      className,
      ...otherProps
    } = this.props;

    return (
      <form
        className={
          classNames(
            'spectrum-Form',
            className
          )
        }
        {...filterDOMProps(otherProps)}>
        {children}
      </form>
    );
  }
}
