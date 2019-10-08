/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import autobind from 'autobind-decorator';
import {chain} from '../../utils/events';
import createId from '../../utils/createId';
import filterDOMProps from '../../utils/filterDOMProps';
import {Menu} from '../../Menu';
import OverlayTrigger from '../../OverlayTrigger';
import PropTypes from 'prop-types';
import React from 'react';

@autobind
export default class Dropdown extends React.Component {
  static propTypes = {
    /**
     * If true, dropdown will close on selection of an item
     */
    closeOnSelect: PropTypes.bool,

    /**
     * Determines what kind of action opens the menu
     */
    trigger: PropTypes.oneOf(['click', 'longClick', 'hover', 'focus']),

    /**
     * Callback for when the dropdown is opened
     */
    onOpen: PropTypes.func,

    /**
     * Callback for when the dropdown is closed
     */
    onClose: PropTypes.func,

    /**
     * Callback for when an item is selected from the dropdown
     */
    onSelect: PropTypes.func,

    /**
     * Aligns the dropdown to the right or left of the button opening the dropdown
     */
    alignRight: PropTypes.bool,

    /**
     * Sets whether the overlay is flippable
     */
    flip: PropTypes.bool
  };

  static defaultProps = {
    closeOnSelect: true,
    trigger: 'click'
  };

  constructor(props) {
    super(props);
    this.dropdownId = createId();
    this.state = {
      open: false
    };
  }

  onOpen(e) {
    this.setState({open: true});
    if (this.props.onOpen) {
      this.props.onOpen(e);
    }
  }

  onClose(e) {
    this.setState({open: false});
    if (this.props.onClose) {
      this.props.onClose(e);
    }
  }

  onMenuClose() {
    this.overlayTrigger.hide();
  }

  onSelect(...args) {
    if (this.props.closeOnSelect) {
      this.onMenuClose();
    }
    if (this.props.onSelect) {
      this.props.onSelect(...args);
    }
  }

  onClick(e) {
    if (this.props.onClick) {
      this.props.onClick(e);
    }
  }

  onKeyDownTrigger(e) {
    if ((typeof e.isDefaultPrevented === 'function' && e.isDefaultPrevented()) || e.defaultPrevented) {
      return;
    }
    if (this.triggerRef) {
      switch (e.key) {
        case 'Enter':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          e.stopPropagation();
          this.triggerRef.onClick();
          break;
      }
    }
  }

  render() {
    const {alignRight, closeOnSelect, flip, trigger, onLongClick, ...otherProps} = this.props;
    const children = React.Children.toArray(this.props.children);
    const triggerChild = children.find(c => c.props.dropdownTrigger) || children[0];
    const triggerId = triggerChild.props.id || this.dropdownId + '-trigger';
    const menu = children.find(c => c.props.dropdownMenu || c.type === Menu) || children[1];
    const menuId = menu.props.id || this.dropdownId + '-menu';
    delete otherProps.onOpen;
    delete otherProps.onClose;
    delete otherProps.onClick;

    return (
      <div {...filterDOMProps(otherProps)}>
        {children.map((child, index) => {
          if (child === triggerChild) {
            return (
              <OverlayTrigger
                target={this}
                trigger={trigger}
                placement={alignRight ? 'bottom right' : 'bottom left'}
                ref={t => this.overlayTrigger = t}
                onLongClick={onLongClick}
                onClick={this.onClick}
                onShow={this.onOpen}
                closeOnSelect={closeOnSelect}
                key={index}
                onHide={this.onClose}
                flip={flip}
                delayHide={0}>
                {React.cloneElement(triggerChild, {
                  id: triggerId,
                  'aria-haspopup': triggerChild.props['aria-haspopup'] || 'true',
                  'aria-expanded': this.state.open || null,
                  'aria-controls': (this.state.open ? menuId : null),
                  onKeyDown: chain(triggerChild.props.onKeyDown, this.onKeyDownTrigger),
                  ref: (node) => {
                    this.triggerRef = node;
                    const {ref} = triggerChild;
                    if (typeof ref === 'function') {
                      ref(node);
                    }
                  }
                })}
                {React.cloneElement(menu, {
                  id: menuId,
                  'aria-labelledby': menu.props['aria-labelledby'] || triggerId,
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
