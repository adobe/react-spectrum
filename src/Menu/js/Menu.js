import autobind from 'autobind-decorator';
import {List} from '../../List';
import Popover from '../../Popover';
import PropTypes from 'prop-types';
import React from 'react';

@autobind
export default class Menu extends React.Component {
  static displayName = 'Menu';

  static propTypes = {
    /**
     * Location of the menu in relation to the element triggering it. If used
     * with overlay trigger and there isn't enough room for the menu in that
     * position, it will make a limited attempt to find a new position.
     */
    placement: PropTypes.oneOf([
      'bottom', 'bottom left', 'bottom right',
      'top', 'top left', 'top right',
      'left', 'left top', 'left bottom',
      'right', 'right top', 'right bottom'
    ]),

    /**
     * Whether the menu is opened.
     */
    open: PropTypes.bool,

    /**
     * Callback when menu closes.
     */
    onClose: PropTypes.func,

    /**
     * Callback when menu item is selected.
     */
    onSelect: PropTypes.func,

    /**
     * String for extra class names to add to the menu
     */
    className: PropTypes.string,

    /**
     * True by default, this keeps focus within children of this component.
     * When disabled, focus may leave this component.
     */
    trapFocus: PropTypes.bool,

    /**
     * The WAI-ARIA role for the menu. Defaults to "menu", but could be "listbox" depending on context.
     */
    role: PropTypes.oneOf(['menu', 'listbox'])
  };

  static defaultProps = {
    trapFocus: true
  };

  getListRef() {
    return this.listRef;
  }

  onClick(e) {
    e.preventDefault();
    if (this.props.onClick) {
      this.props.onClick(e);
    }
  }

  render() {
    const {
      children,
      className,
      open,
      onClose,
      onSelect,
      placement,
      role = 'menu',
      style,
      trapFocus,
      ...otherProps
    } = this.props;

    delete otherProps.target;
    delete otherProps.onClick;

    return (
      <Popover isDialog={false} placement={placement} open={open} onClose={onClose} style={style} trapFocus={trapFocus}>
        <List ref={l => this.listRef = l} role={role} className={className} onClick={this.onClick} {...otherProps}>
          {React.Children.map(children, child => React.cloneElement(child, {
            onSelect
          }))}
        </List>
      </Popover>
    );
  }
}
