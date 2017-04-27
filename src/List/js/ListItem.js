import classNames from 'classnames';
import Icon from '../../Icon';
import React, {Component} from 'react';

export default class ListItem extends Component {
  static defaultProps = {
    iconSize: 'S',
    selected: false,
    disabled: false,
    onSelect: function () {},
    onFocusNext: function () {},
    onFocusPrevious: function () {},
    onFocusFirst: function () {},
    onFocusLast: function () {}
  }

  handleClick = e => {
    if (this.props.onClick) {
      this.props.onClick(e);
    } else {
      this.handleSelect(e);
    }
  }

  handleKeyDown = e => {
    switch (e.which) {
      case 13: // enter
        this.handleSelect(e);
        break;
      case 33: // page up
      case 35: // home
        e.preventDefault();
        this.handleFocusFirst(e);
        break;
      case 34: // page down
      case 36: // end
        e.preventDefault();
        this.handleFocusLast(e);
        break;
      case 37: // left
      case 38: // up
        e.preventDefault();
        this.handleFocusPrevious(e);
        break;
      case 39: // right
      case 40: // down
        e.preventDefault();
        this.handleFocusNext(e);
        break;
      default:
        // do nothing
    }
  }

  handleMouseEnter = e => {
    if (this.props.onMouseEnter) {
      this.props.onMouseEnter(e);
    } else {
      e.target.focus();
    }
  }

  handleSelect = e => {
    this.props.onSelect(e);
  }

  handleFocusFirst = e => {
    this.props.onFocusFirst(e);
  }

  handleFocusLast = e => {
    this.props.onFocusLast(e);
  }

  handleFocusPrevious = e => {
    this.props.onFocusPrevious(e);
  }

  handleFocusNext = e => {
    this.props.onFocusNext(e);
  }

  render() {
    const {
      icon,
      iconSize,
      label,
      className,
      children,
      selected,
      disabled,
      role = 'option',
      ...otherProps
    } = this.props;

    return (
      <li
        className={
          classNames(
            'coral-BasicList-item',
            {
              'is-selected': selected,
              'is-disabled': disabled
            },
            className
          )
        }
        onKeyDown={!disabled && this.handleKeyDown}
        onMouseEnter={!disabled && this.handleMouseEnter}
        onClick={!disabled && this.handleClick}
        tabIndex="0"
        role={role}
        aria-checked={selected}
        aria-selected={selected}
        aria-disabled={disabled}
        { ...otherProps }
      >
        {icon &&
          <Icon className="coral-BasicList-item-icon" icon={ icon } size={ iconSize } />
        }
        <div className="coral-BasicList-item-outerContainer">
          <div className="coral-BasicList-item-contentContainer">
            <div className="coral-BasicList-item-content">
              {label || children}
            </div>
          </div>
        </div>
      </li>
    );
  }
}
