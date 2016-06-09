import React, { Component } from 'react';
import classNames from 'classnames';
import ShellMenu from './ShellMenu';

import Search from '../Search';
import Button from '../Button';

import './ShellOrgSwitcher.styl';

export default class ShellOrgSwitcher extends Component {
  static defaultProps = {
    manageOrgsUrl: '#',
    onOrgChange: () => {}
  };

  state = {
    searchTerm: ''
  };

  handleSearchChange = searchTerm => {
    this.setState({ searchTerm });
  }

  visibilityFilter = label => {
    const { searchTerm } = this.state;
    return label.toLowerCase().indexOf(searchTerm) !== -1;
  }

  handleSelect = e => {
    this.props.onOrgChange(e);
  }

  handleFocusFirst = e => {
    this.getItems()[0].focus();
  }

  handleFocusLast = e => {
    const items = this.getItems();
    items[items.length - 1].focus();
  }

  handleFocusPrevious = e => {
    const items = this.getItems();
    let index = items.indexOf(e.target) - 1;
    if (index < 0) {
      index = items.length - 1;
    }
    items[index].focus();
  }

  handleFocusNext = e => {
    const items = this.getItems();
    let index = items.indexOf(e.target) + 1;
    if (index >= items.length) {
      index = 0;
    }
    items[index].focus();
  }

  handleVisible = () => {
    if (this.refs) {
      this.refs.switcher.querySelector('.coral-Search-input').focus();
    }
  }

  getItems() {
    return Array.prototype.slice.call(
      this.refs.switcher.querySelectorAll(
        '.coral-Shell-orgSwitcher-item:not(.is-parent):not([hidden]), .coral-Shell-orgSwitcher-subitem:not([hidden])'
      )
    );
  }

  getSelectedLabel(children) {
    let label;
    React.Children.forEach(children, child => {
      if (child.props.selected) {
        label = child.props.label;
      } else if (child.props.children) {
        if (!label) {
          label = this.getSelectedLabel(child.props.children);
        }
      }
    });
    return label;
  }

  getResultCount(children, resultCount = 0) {
    React.Children.forEach(children, child => {
      if (child.props.children) {
        resultCount = this.getResultCount(child.props.children, resultCount);
      } else if (this.visibilityFilter(child.props.label)) {
        resultCount++;
      }
    });
    return resultCount;
  }

  render() {
    const {
      label,
      className,
      children,
      manageOrgsUrl,
      ...otherProps
    } = this.props;

    return (
      <ShellMenu
        placement="right"
        animateFrom="top"
        target={ <Button variant="minimal" className="coral-Shell-menu-button">{ this.getSelectedLabel(children) }</Button> }
        onVisible={ this.handleVisible }
        { ...otherProps }
      >
        <div className={ classNames('coral-BasicList coral-Shell-orgSwitcher', className) } ref="switcher">
          <label className="u-coral-screenReaderOnly">Search Organizations</label>
          <Search
            className="coral-Shell-orgSwitcher-search"
            placeholder="Search Organizations"
            onChange={ this.handleSearchChange }
            quiet
          />
          <div className="coral-Shell-orgSwitcher-items">
            {
              React.Children.map(children, (child, index) => {
                if (typeof child === 'object' && child && child.type) { // Is this a react element?
                  const key = child.key || String(index);

                  return React.cloneElement(
                    child,
                    {
                      key,
                      visibilityFilter: this.visibilityFilter,
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
          <div className="coral-Shell-orgSwitcher-resultMessage" hidden={ this.getResultCount(children) !== 0 }>
            <div className="coral-Shell-orgSwitcher-resultMessage-container">
              <div className="coral-Heading--1 coral-Shell-orgSwitcher-resultMessage-heading">
                No organizations found.
              </div>
            </div>
          </div>
          <div className="coral-Shell-orgSwitcher-footer">
            <Button
              element="a"
              variant="minimal"
              href={ manageOrgsUrl }
              block
            >
              Manage Organizations
            </Button>
          </div>
        </div>
      </ShellMenu>
    );
  }
}
