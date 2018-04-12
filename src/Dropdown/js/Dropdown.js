import autobind from 'autobind-decorator';
import createId from '../../utils/createId';
import {Menu} from '../../Menu';
import OverlayTrigger from '../../OverlayTrigger';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

@autobind
export default class Dropdown extends React.Component {
  static propTypes = {
    closeOnSelect: PropTypes.bool
  };

  static defaultProps = {
    closeOnSelect: true
  };

  constructor(props) {
    super(props);
    this.dropdownId = createId();
  }

  onClose(e) {
    if (e && e.type === 'keyup') {
      this.restoreFocusOnClose();
    }
    if (this.props.onClose) {
      this.props.onClose(e);
    }
  }

  onMenuClose() {
    this.overlayTrigger.hide();
    this.restoreFocusOnClose();
  }

  onSelect(...args) {
    if (this.props.closeOnSelect) {
      this.onMenuClose();
    }
    if (this.props.onSelect) {
      this.props.onSelect(...args);
    }
  }

  restoreFocusOnClose() {
    const node = ReactDOM.findDOMNode(this.triggerRef);
    if (node && node.focus) {
      node.focus();
    }
  }

  render() {
    const {alignRight, onOpen, closeOnSelect, ...otherProps} = this.props;
    const children = React.Children.toArray(this.props.children);
    const trigger = children.find(c => c.props.dropdownTrigger) || children[0];
    const menu = children.find(c => c.props.dropdownMenu || c.type === Menu);
    const menuId = menu.props.id || this.dropdownId + '-menu';

    delete otherProps.onClose;

    return (
      <div {...otherProps}>
        {children.map((child, index) => {
          if (child === trigger) {
            return (
              <OverlayTrigger
                target={this}
                trigger="click"
                placement={alignRight ? 'bottom right' : 'bottom left'}
                ref={t => this.overlayTrigger = t}
                onShow={onOpen}
                closeOnSelect={closeOnSelect}
                key={index}
                onHide={this.onClose} >
                {React.cloneElement(trigger, {
                  'aria-haspopup': 'true',
                  'aria-controls': menuId,
                  ref: (node) => {
                    this.triggerRef = node;
                    const {ref} = trigger;
                    if (typeof ref === 'function') {
                      ref(node);
                    }
                  }
                })}
                {React.cloneElement(menu, {
                  id: menuId,
                  onClose: this.onMenuClose,
                  onSelect: this.onSelect,
                  autoFocus: true
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
