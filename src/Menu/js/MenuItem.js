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
