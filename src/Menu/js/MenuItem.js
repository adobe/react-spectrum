import {ListItem} from '../../List';
import React, {Component} from 'react';

/**
 * An item in a Menu
 */
export default class MenuItem extends Component {
  static displayName = 'MenuItem';

  render() {
    const {
      role = 'menuitem',
      ...otherProps
    } = this.props;

    return <ListItem role={role} {...otherProps} />;
  }
}
