import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import {interpretKeyboardEvent} from '../../utils/events';
import MenuCheckmark from '../../Icon/core/MenuCheckmark';
import React, {Component} from 'react';

export default class ListItem extends Component {
  static defaultProps = {
    selected: false,
    disabled: false,
    onSelect: function () {}
  }

  handleClick = e => {
    if (this.props.onClick) {
      this.props.onClick(e);
    } else {
      this.onSelectFocused(e);
    }
  }

  handleMouseEnter = e => {
    if (this.props.onMouseEnter) {
      this.props.onMouseEnter(e);
    } else {
      e.currentTarget.focus();
    }
  }

  onSelectFocused = e => {
    e.preventDefault();
    this.props.onSelect(this.props.value, e);
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
      role = 'option',
      ...otherProps
    } = this.props;

    return (
      <li
        className={
          classNames(
            'spectrum-SelectList-item',
            {
              'is-selected': selected,
              'is-disabled': disabled,
              'is-focused': focused
            },
            className
          )
        }
        onKeyDown={disabled ? null : interpretKeyboardEvent.bind(this)}
        onMouseEnter={disabled ? null : this.handleMouseEnter}
        onClick={disabled ? null : this.handleClick}
        tabIndex="0"
        role={role}
        aria-checked={selected}
        aria-selected={selected}
        aria-disabled={disabled}
        {...otherProps}>
        {cloneIcon(icon, {
          className: 'react-spectrum-List-item-icon',
          size: 'S'
        })}
        <div className="react-spectrum-List-item-content">
          {label || children}
          {selected && <MenuCheckmark size={null} className="spectrum-SelectList-checkmark" />}
        </div>
      </li>
    );
  }
}
