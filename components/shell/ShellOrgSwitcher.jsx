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

  handleSearchChange = val => {
    // TODO: Use fuzzy search.
  }

  render() {
    const {
      title,
      className,
      children,
      manageOrgsUrl,
      ...otherProps
    } = this.props;

    return (
      <ShellMenu
        placement="right"
        animateFrom="top"
        target={ <Button variant="minimal" className="coral-Shell-menu-button">{ title }</Button> }
        { ...otherProps }
      >
        <div className={ classNames('coral-BasicList coral-Shell-orgSwitcher', className) }>
          <label className="u-coral-screenReaderOnly">Search Organizations</label>
          <Search
            className="coral-Shell-orgSwitcher-search"
            placeholder="Search Organizations"
            onChange={ this.handleSearchChange }
            quiet
          />
          <div className="coral-Shell-orgSwitcher-items">
            { children }
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
