import autobind from 'autobind-decorator';
import classNames from 'classnames';
import {Menu} from '../../Menu';
import OverlayTrigger from '../../OverlayTrigger';
import React from 'react';
import ReactDOM from 'react-dom';

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
    this.overlayTrigger.hide();
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
    const {alignRight, ...otherProps} = this.props;
    const children = React.Children.toArray(this.props.children);
    const trigger = children.find(c => c.props.dropdownTrigger) || children[0];
    const menu = children.find(c => c.props.dropdownMenu || c.type === Menu);
    delete otherProps.onBlur;
    delete otherProps.onFocus;

    return (
      <div {...otherProps}>
        {children.map(child => {
          if (child === trigger) {
            return (
              <OverlayTrigger trigger="click" placement={alignRight ? 'bottom right' : 'bottom left'} ref={t => this.overlayTrigger = t}>
                {trigger}
                {React.cloneElement(menu, {
                  className: classNames(menu.props.className, 'spectrum-Dropdown-flyout'),
                  onClose: this.onClose,
                  onSelect: this.onSelect
                })}
              </OverlayTrigger>
            );
          } else if (child !== menu) {
            return child;
          }
        })}
      </div>
    );
  }
}
