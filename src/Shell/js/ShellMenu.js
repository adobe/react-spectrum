import classNames from 'classnames';
import {getTransitionEvent} from '../../utils/transition';
import Portal from 'react-overlays/lib/Portal';
import React, {Component} from 'react';
import RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper';
import '../style/ShellMenu.styl';

export default class ShellMenu extends Component {
  static defaultProps = {
    defaultOpen: false,
    placement: 'right', // top, right
    animateFrom: 'right', // top, right
    full: false,
    dark: false,
    top: false, // if true, appears on top of the other menus
    onOpen: function () {},
    onClose: function () {},
    onVisible: function () {},
    onHidden: function () {}
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
    const {menu} = this.refs;
    menu.addEventListener(getTransitionEvent(), this.handleTransitionEnd);
  }

  componentWillReceiveProps(nextProps) {
    if ('open' in nextProps) {
      this.setState({open: nextProps.open});
    }
  }

  componentWillUnmount() {
    const {menu} = this.refs;
    menu.removeEventListener(getTransitionEvent(), this.handleTransitionEnd);
  }

  setOpen(open) {
    if (!('open' in this.props)) {
      this.setState({open});
    }
  }

  handleTransitionEnd = e => {
    if (e.propertyName !== 'transform') {
      return;
    }

    const {onVisible, onHidden} = this.props;
    const {open} = this.state;

    if (open) {
      onVisible();
    } else {
      onHidden();
    }
    this.setState({visible: open});
  }

  handleMenuToggle = e => {
    const {open} = this.state;

    if (open) {
      this.handleMenuClose(e);
    } else {
      this.handleMenuOpen(e);
    }
  }

  handleTargetClick = e => {
    const {open} = this.state;
    // If it's already open, close it.
    if (open) {
      this.handleMenuClose();
    } else {
      this.handleMenuOpen();
    }
    e.preventDefault();
  }

  handleMenuOpen = () => {
    const {onOpen, index} = this.props;
    this.setOpen(true);
    onOpen(index);
  }

  handleMenuClose = () => {
    const {onClose, index} = this.props;

    this.setOpen(false);
    onClose(index);
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

    const {open, visible} = this.state;
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
            React.cloneElement(target, {onClick: this.handleTargetClick})
          }
        </span>
        <Portal>
          <RootCloseWrapper onRootClose={this.handleMenuClose} disabled={!open}>
            <div
              ref="menu"
              style={ {zIndex} }
              className={
                classNames(
                  'coral3-Shell-menu',
                  `coral3-Shell-menu--placement-${ placement }`,
                  `coral3-Shell-menu--from-${ animateFrom }`,
                  {
                    'coral3-Shell-menu--full': full,
                    'is-open': open,
                    'coral--dark': dark,
                    'is-visible': open || visible
                  }
                )
              }
            >
              { children }
            </div>
          </RootCloseWrapper>
        </Portal>
      </span>
    );
  }
}

ShellMenu.displayName = 'ShellMenu';
