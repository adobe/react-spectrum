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

import {ListItem} from '../../List';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

/**
 * An item in a Menu
 */
export default class MenuItem extends Component {
  static displayName = 'MenuItem';
  static propTypes = {
    ...ListItem.propTypes,

    /**
     * The WAI-ARIA role for the list item.
     * Defaults to "menuitem", but could be "menuitemcheckbox", "menuitemradio" or "option" depending on context.
     */
    role: PropTypes.oneOf(['menuitem', 'menuitemcheckbox', 'menuitemradio', 'option'])
  }

  static defaultProps = {
    role: 'menuitem'
  }

  render() {
    const {
      role = 'menuitem',
      ...otherProps
    } = this.props;

    return <ListItem role={role} {...otherProps} />;
  }
}
