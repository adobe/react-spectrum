import autobind from 'autobind-decorator';
import CheckmarkMedium from '../../Icon/core/CheckmarkMedium';
import ChevronRightMedium from '../../Icon/core/ChevronRightMedium';
import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import filterDOMProps from '../../utils/filterDOMProps';
import {interpretKeyboardEvent} from '../../utils/events';
import React, {Component} from 'react';

/**
 * An item in a list
 */
@autobind
export default class ListItem extends Component {
  static defaultProps = {
    selected: false,
    disabled: false,
    onSelect: function () {}
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

    if (this.props.onSelect) {
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
