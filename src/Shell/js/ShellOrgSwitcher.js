import React, {Component} from 'react';
import classNames from 'classnames';
import ShellMenu from './ShellMenu';

import Search from '../../Search';
import Button from '../../Button';
import {List} from '../../List';

import '../style/ShellOrgSwitcher.styl';

export default class ShellOrgSwitcher extends Component {
  static defaultProps = {
    manageOrgsUrl: '#',
    onOrgChange: function () {}
  };

  state = {
    searchTerm: ''
  };

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

  handleVisible = () => {
    if (this.contentRef) {
      this.contentRef.querySelector('.coral-Search-input').focus();
    }
  }

  handleSelect = e => {
    this.props.onOrgChange(e);
  }

  visibilityFilter = label => {
    const {searchTerm} = this.state;
    return label.toLowerCase().indexOf(searchTerm) !== -1;
  }

  handleSearchChange = searchTerm => {
    this.setState({searchTerm});
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
        target={
          <Button
            variant="minimal"
            className="coral3-Shell-menu-button"
          >
            { this.getSelectedLabel(children) }
          </Button>
        }
        onVisible={ this.handleVisible }
        { ...otherProps }
      >
        <div
          ref={ el => { this.contentRef = el; } }
          className={
            classNames(
              'coral-BasicList',
              'coral3-Shell-orgSwitcher',
              className
            )
          }
        >
          <label className="u-coral-screenReaderOnly">Search Organizations</label>
          <Search
            className="coral3-Shell-orgSwitcher-search"
            placeholder="Search Organizations"
            onChange={ this.handleSearchChange }
            quiet
          />

          <List
            className="coral3-Shell-orgSwitcher-items"
            listItemSelector={
              [
                '.coral3-Shell-orgSwitcher-item:not(.is-parent):not([hidden])',
                '.coral3-Shell-orgSwitcher-subitem:not([hidden])'
              ].join(', ')
            }
            onSelect={ this.handleSelect }
          >
            {
              React.Children.map(children, (child, index) => (
                React.cloneElement(
                  child,
                  {
                    key: child.key || String(index),
                    visibilityFilter: this.visibilityFilter
                  }
                )
              ))
            }
          </List>
          <div
            className="coral3-Shell-orgSwitcher-resultMessage"
            hidden={ this.getResultCount(children) !== 0 }
          >
            <div className="coral3-Shell-orgSwitcher-resultMessage-container">
              <div className="coral-Heading--1 coral3-Shell-orgSwitcher-resultMessage-heading">
                No organizations found.
              </div>
            </div>
          </div>
          <div className="coral3-Shell-orgSwitcher-footer">
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

ShellOrgSwitcher.displayName = 'ShellOrgSwitcher';
