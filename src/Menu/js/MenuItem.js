import {ListItem} from '../../List';
import React, {Component} from 'react';

export default class MenuItem extends Component {
  render() {
    const {
      role = 'menuitem',
      ...otherProps
    } = this.props;

    return <ListItem role={role} {...otherProps} />;
  }
}
