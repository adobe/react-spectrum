import React, { Component } from 'react';
import classNames from 'classnames';

import Icon from '../Icon';

import './ShellOrganization.styl';

export default class ShellOrganization extends Component {
  static defaultProps = {
    selected: false,
    isSubItem: false,
    visibilityFilter: () => {},
    onSelect: () => {},
    onFocusNext: () => {},
    onFocusPrevious: () => {},
    onFocusFirst: () => {},
    onFocusLast: () => {}
  };

  state = {
    visible: true
  };

  componentWillReceiveProps(nextProps) {
    const { visibilityFilter, label, children } = nextProps;
    this.determineVisibility(visibilityFilter, label, children);
  }

  determineVisibility(visibilityFilter, label, children) {
    let visible = false;

    if (label) {
      visible = visibilityFilter(label);
    }

    if (!visible && children) {
      let childVisible = false;
      React.Children.forEach(children, child => {
        childVisible = childVisible || visibilityFilter(child.props.label);
      });
      visible = childVisible;
    }

    this.setState({ visible });
  }

  handleClick = e => {
    if (!this.hasChildren()) {
      this.handleSelect(e);
    }
  }

  handleKeyDown = e => {
    switch(e.which) {
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
    }
  }

  handleMouseEnter = e => {
    if (!this.hasChildren()) {
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

  hasChildren() {
    const { children } = this.props;
    return !!children;
  }

  isChildSelected(children) {
    let childSelected = false;
    React.Children.forEach(children, child => {
      if (child.props.selected) {
        childSelected = true;
      }
    });
    return childSelected;
  }

  render() {
    const {
      hiddenFilter,
      selected,
      label,
      isSubItem,
      icon = isSubItem ? 'adobeTarget' : undefined,
      visibilityFilter,
      className,
      children,
      ...otherProps
    } = this.props;

    const { visible } = this.state;
    const isChildSelected = children && this.isChildSelected(children);

    return (
      <div
        className={
          classNames(
            'coral-BasicList-item',
            `coral-Shell-orgSwitcher-${ isSubItem ? 'sub' : '' }item`,
            {
              'is-selected': selected || isChildSelected,
              'is-parent': children,
              'is-child-selected': isChildSelected
            },
            className
          )
        }
        role="button"
        tabIndex={ this.hasChildren() ? null : '0' }
        selected={ selected }
        onKeyDown={ this.handleKeyDown }
        onMouseEnter={ this.handleMouseEnter }
        onClick={ this.handleClick }
        hidden={ !visible }
        { ...otherProps }
      >
        {
          icon &&
          <Icon className="coral-BasicList-item-icon" icon={ icon } size={ isSubItem ? 'S' : 'M' } />
        }
        <div className="coral-BasicList-item-outerContainer">
          <div className="coral-BasicList-item-contentContainer">
            <coral-list-item-content className="coral-BasicList-item-content">
              { label }
            </coral-list-item-content>
          </div>
        </div>
        {
          selected &&
          <Icon className="coral-Shell-orgSwitcher-item-checkmark" icon="check" size="XS" />
        }
        {
          children && !isSubItem &&
          <div className="coral-Shell-orgSwitcher-subitems">
            {
              React.Children.map(children, (child, index) => {
                if (typeof child === 'object' && child && child.type) { // Is this a react element?
                  const key = child.key || String(index);

                  return React.cloneElement(
                    child,
                    {
                      key,
                      visibilityFilter,
                      onSelect: this.handleSelect,
                      onFocusNext: this.handleFocusNext,
                      onFocusPrevious: this.handleFocusPrevious,
                      onFocusFirst: this.handleFocusFirst,
                      onFocusLast: this.handleFocusLast,
                    }
                  )
                } else { // Must be a string
                  return child;
                }
              })
            }
          </div>
        }
      </div>
    );
  }
}
