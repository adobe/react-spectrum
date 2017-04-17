import React, { Component } from 'react';
import classNames from 'classnames';

import Icon from '../../Icon';

export default class ListItem extends Component {
  static defaultProps = {
    element: 'span',
    iconSize: 'M',
    selected: false,
    onSelect: () => {},
    onFocusNext: () => {},
    onFocusPrevious: () => {},
    onFocusFirst: () => {},
    onFocusLast: () => {}
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
        this.handleFocusFirst(e);
        break;
      case 34: // page down
      case 36: // end
        this.handleFocusLast(e);
        break;
      case 37: // left
      case 38: // up
        this.handleFocusPrevious(e);
        break;
      case 39: // right
      case 40: // down
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
      element,
      icon,
      iconSize,
      label,
      className,
      children,
      selected,
      ...otherProps
    } = this.props;
    const Element = element;

    return (
      <Element
        className={
          classNames(
            'coral-BasicList-item',
            { 'is-selected': selected },
            className
          )
        }
        onKeyDown={ this.handleKeyDown }
        onMouseEnter={ this.handleMouseEnter }
        onClick={ this.handleClick }
        tabIndex="0"
        { ...otherProps }
      >
        {
          icon &&
          <Icon className="coral-BasicList-item-icon" icon={ icon } size={ iconSize } />
        }
        {
          <div className="coral-BasicList-item-outerContainer">
            <div className="coral-BasicList-item-contentContainer">
              <coral-list-item-content className="coral-BasicList-item-content">
                { label }
              </coral-list-item-content>
            </div>
          </div>
        }
        { children }
      </Element>
    );
  }
}

ListItem.displayName = 'ListItem';
