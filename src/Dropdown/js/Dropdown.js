import classNames from 'classnames';
import {Menu} from '../../Menu';
import React from 'react';
import '../style/index.styl';

export default class Dropdown extends React.Component {
  state = {
    showingMenu: false
  };

  onClick = () => {
    this.setState({
      showingMenu: !this.state.showingMenu
    });
  }

  onClose = () => {
    this.setState({showingMenu: false});
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  onSelect = (...args) => {
    this.onClose();
    if (this.props.onSelect) {
      this.props.onSelect(...args);
    }
  }

  render() {
    const {alignRight, className, ...otherProps} = this.props;
    const children = React.Children.toArray(this.props.children);
    const trigger = children.find(c => c.props.dropdownTrigger) || children[0];
    const menu = children.find(c => c.props.dropdownMenu || c.type === Menu);

    return (
      <div className={classNames('coral-Dropdown', {'is-openBelow': this.state.showingMenu}, className)} {...otherProps}>
        {children.map(child => {
          if (child === trigger) {
            return React.cloneElement(child, {onClick: this.onClick});
          } else if (child === menu) {
            return this.state.showingMenu && React.cloneElement(child, {
              className: classNames(child.props.className, 'coral-Dropdown-menu', {'align-right': alignRight}),
              onClose: this.onClose,
              onSelect: this.onSelect
            });
          } else {
            return child;
          }
        })}
      </div>
    );
  }
}
