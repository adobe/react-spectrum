import autobind from 'autobind-decorator';
import classNames from 'classnames';
import {Menu} from '../../Menu';
import React from 'react';
import '../style/index.styl';

@autobind
export default class Dropdown extends React.Component {
  state = {
    showingMenu: false
  };

  show() {
    this.setState({showingMenu: true});
    if (this.props.onFocus) {
      this.props.onFocus();
    }
  }

  hide() {
    this.setState({showingMenu: false});
    if (this.props.onBlur) {
      this.props.onBlur();
    }
  }

  onClick() {
    if (this.state.showingMenu) {
      this.hide();
    } else {
      this.show();
    }
  }

  onClose() {
    this.hide();
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  onSelect(...args) {
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
    delete otherProps.onBlur;
    delete otherProps.onFocus;

    return (
      <div className={classNames('coral-Dropdown', {'is-openBelow': this.state.showingMenu}, className)} {...otherProps}>
        {children.map(child => {
          if (child === trigger) {
            return React.cloneElement(child, {onClick: menu ? this.onClick : null});
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
