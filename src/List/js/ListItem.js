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
import CheckmarkMedium from '../../Icon/core/CheckmarkMedium';
import ChevronRightMedium from '../../Icon/core/ChevronRightMedium';
import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import filterDOMProps from '../../utils/filterDOMProps';
import {interpretKeyboardEvent} from '../../utils/events';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

/**
 * An item in a list
 */
@autobind
export default class ListItem extends Component {
  static propTypes = {
    /**
     * Whether or not the list item is selected
     */
    selected: PropTypes.bool,

    /**
     * Whether or not  the list item is disabled
     */
    disabled: PropTypes.bool,

    /**
     * Callback for when the list item is clicked
     */
    onClick: PropTypes.func,

    /**
     * Callback for when the list item is selected
     */
    onSelect: PropTypes.func,

    /**
     * The WAI-ARIA role for the list item. Defaults to "option", but could be "menuitem", "menuitemcheckbox", or "menuitemradio" depending on context.
     */
    role: PropTypes.oneOf(['option', 'menuitem', 'menuitemcheckbox', 'menuitemradio'])
  }

  static defaultProps = {
    selected: false,
    disabled: false,
    onSelect: function () {},
    role: 'option'
  }

  handleMouseEnter(e) {
    if (this.props.onMouseEnter) {
      this.props.onMouseEnter(e);
    } else {
      e.currentTarget.focus();
    }
  }

  handleFocus(e) {
    if (this.props.onFocus) {
      this.props.onFocus(e);
    }
  }

  handleBlur(e) {
    if (this.props.onBlur) {
      this.props.onBlur(e);
    }
  }

  onSelectFocused(e) {
    e.preventDefault();

    if (this.props.onClick) {
      this.props.onClick(e);
    }

    if (this.props.onSelect && !e.isPropagationStopped()) {
      this.props.onSelect(this.props.value, e);
    }
  }

  onKeyDown(e) {
    const {onKeyDown, disabled} = this.props;
    if (onKeyDown) {
      onKeyDown(e);
    }
    if (!disabled) {
      interpretKeyboardEvent.call(this, e);
    }
  }

  render() {
    const {
      icon,
      label,
      className,
      children,
      selected,
      disabled,
      focused,
      hasNestedMenu,
      tabIndex = 0,
      role = 'option',
      ...otherProps
    } = this.props;

    delete otherProps.value;

    return (
      /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */
      <li
        {...filterDOMProps(otherProps)}
        className={
          classNames(
            'spectrum-Menu-item',
            {
              'is-selected': selected,
              'is-disabled': disabled,
              'is-focused': focused
            },
            className
          )
        }
        onKeyDown={this.onKeyDown}
        onMouseEnter={disabled ? null : this.handleMouseEnter}
        onFocus={disabled ? null : this.handleFocus}
        onClick={disabled ? null : this.onSelectFocused}
        onBlur={this.handleBlur}
        /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
        tabIndex={!disabled ? tabIndex : null}
        role={role}
        aria-checked={role === 'menuitemcheckbox' || role === 'menuitemradio' ? !!selected : null}
        aria-selected={role === 'option' ? (!!selected || !!focused) : null}
        aria-disabled={disabled || null}>
        {cloneIcon(icon, {
          size: 'S'
        })}
        <span className="spectrum-Menu-itemLabel">{label || children}</span>
        {selected && <CheckmarkMedium size={null} className="spectrum-Menu-checkmark" />}
        {hasNestedMenu && <ChevronRightMedium className="spectrum-Menu-chevron" />}
      </li>
    );
  }
}
