import React, {Component} from 'react';
import classNames from 'classnames';

import ListItem from '../../List/js/ListItem';
import Icon from '../../Icon';

import '../style/ShellOrganization.styl';

export default class ShellOrganization extends Component {
  static defaultProps = {
    selected: false,
    isSubItem: false,
    visibilityFilter: function () {},
    onSelect: function () {}
  };

  state = {
    visible: true
  };

  componentWillReceiveProps(nextProps) {
    const {visibilityFilter, label, children} = nextProps;
    this.determineVisibility(visibilityFilter, label, children);
  }

  handleSelect = () => {
    if (!this.hasChildren()) {
      this.props.onSelect(this.props.name || this.props.label);
    }
  }

  handleMouseEnter = e => {
    if (!this.hasChildren()) {
      e.target.focus();
    }
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

    this.setState({visible});
  }

  hasChildren() {
    const {children} = this.props;
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
      selected,
      label,
      isSubItem,
      icon = isSubItem ? 'adobeTarget' : undefined,
      visibilityFilter,
      className,
      children,
      onSelect,
      ...otherProps
    } = this.props;

    const {visible} = this.state;
    const isChildSelected = children && this.isChildSelected(children);

    return (
      <ListItem
        className={
          classNames(
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
        label={ label }
        icon={ icon }
        iconSize={ isSubItem ? 'S' : 'M' }
        selected={ selected }
        hidden={ !visible }
        onMouseEnter={ this.handleMouseEnter }
        onSelect={ this.handleSelect }
        { ...otherProps }
      >
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
                      onSelect,
                      onFocusNext: this.handleFocusNext,
                      onFocusPrevious: this.handleFocusPrevious,
                      onFocusFirst: this.handleFocusFirst,
                      onFocusLast: this.handleFocusLast
                    }
                  );
                }

                // Must be a string
                return child;
              })
            }
          </div>
        }
      </ListItem>
    );
  }
}

ShellOrganization.displayName = 'ShellOrganization';
