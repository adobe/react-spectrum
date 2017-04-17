import React, { Component } from 'react';
import classNames from 'classnames';
import Portal from 'react-portal';
import { getTransitionEvent } from '../../../utils/transition';

import './ShellMenu.styl';

export default class ShellMenu extends Component {
  static defaultProps = {
    defaultOpen: false,
    placement: 'right', // top, right
    animateFrom: 'right', // top, right
    full: false,
    dark: false,
    top: false, // if true, appears on top of the other menus
    onOpen: () => {},
    onClose: () => {},
    onVisible: () => {},
    onHidden: () => {}
  };

  constructor(props) {
    super(props);

    const {
      open,
      defaultOpen
    } = props;

    this.state = {
      open: open !== undefined ? open : defaultOpen,
      visible: false
    };
  }

  componentDidMount() {
    const { menu } = this.refs;
    menu.addEventListener(getTransitionEvent(), this.handleTransitionEnd);
  }

  componentWillReceiveProps(nextProps) {
    if ('open' in nextProps) {
      this.setState({ open: nextProps.open });
      if (nextProps.open) {
        this.addOutsideClickListeners();
      } else {
        this.removeOutsideClickListeners();
      }
    }
  }

  componentWillUnmount() {
    const { menu } = this.refs;
    this.removeOutsideClickListeners();
    menu.removeEventListener(getTransitionEvent(), this.handleTransitionEnd);
  }

  setOpen(open) {
    if (!('open' in this.props)) {
      this.setState({ open });

      if (open) {
        this.addOutsideClickListeners();
      } else {
        this.removeOutsideClickListeners();
      }
    }
  }

  addOutsideClickListeners() {
    document.addEventListener('mouseup', this.handleOutsideClick);
    document.addEventListener('touchstart', this.handleOutsideClick);
  }

  removeOutsideClickListeners() {
    document.removeEventListener('mouseup', this.handleOutsideClick);
    document.removeEventListener('touchstart', this.handleOutsideClick);
  }

  handleTransitionEnd = e => {
    if (e.propertyName !== 'transform') {
      return;
    }

    const { onVisible, onHidden } = this.props;
    const { open } = this.state;

    if (open) {
      onVisible();
    } else {
      onHidden();
    }
    this.setState({ visible: open });
  }

  handleMenuToggle = e => {
    const { open } = this.state;

    if (open) {
      this.handleMenuClose(e);
    } else {
      this.handleMenuOpen(e);
    }
  }

  handleTargetClick = e => {
    const { open } = this.state;
    // If it's already open, close it.
    if (open) {
      this.handleMenuClose();
    } else {
      this.handleMenuOpen();
    }
    e.preventDefault();
  }

  handleMenuOpen = () => {
    const { onOpen, index } = this.props;
    this.setOpen(true);
    onOpen(index);
  }

  handleMenuClose = () => {
    const { onClose, index } = this.props;

    this.setOpen(false);
    onClose(index);
  }

  handleOutsideClick = e => {
    const { target, menu } = this.refs;

    // If the click happens on the menu, don't have it be closed.
    // If the click happens on the target element, it will be closed within the handleTargetClick
    // function.
    if (menu.contains(e.target) || target.contains(e.target)) {
      return;
    }

    e.stopPropagation();
    this.handleMenuClose();
  }

  render() {
    const {
      placement,
      animateFrom,
      full,
      dark,
      top,
      target,
      children
    } = this.props;

    const { open, visible } = this.state;
    let zIndex;
    if (open) {
      zIndex = top ? 10018 : 10015;
    } else {
      zIndex = top ? 10017 : 10010;
    }

    return (
      <span>
        <span ref="target">
          {
            React.cloneElement(target, { onClick: this.handleTargetClick })
          }
        </span>
        <Portal
          onClose={ this.handleMenuClose }
          isOpened
        >
          <div
            ref="menu"
            style={ { zIndex } }
            className={
              classNames(
                'coral-Shell-menu',
                `coral-Shell-menu--placement-${ placement }`,
                `coral-Shell-menu--from-${ animateFrom }`,
                {
                  'coral-Shell-menu--full': full,
                  'is-open': open,
                  'coral--dark': dark,
                  'is-visible': open || visible
                }
              )
            }
          >
            { children }
          </div>
        </Portal>
      </span>
    );
  }
}

ShellMenu.displayName = 'ShellMenu';
