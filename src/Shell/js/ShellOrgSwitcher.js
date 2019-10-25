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

import Button from '../../Button';
import classNames from 'classnames';
import convertUnsafeMethod from '../../utils/convertUnsafeMethod';
import React, {Component} from 'react';
import Search from '../../Search';
import SelectList from '../../SelectList';
import ShellMenu from './ShellMenu';
import '../style/ShellOrgSwitcher.styl';

@convertUnsafeMethod
export default class ShellOrgSwitcher extends Component {
  static defaultProps = {
    value: '',
    manageOrgsUrl: '#',
    options: [],
    onOrgChange: () => {}
  };

  state = {
    searchTerm: '',
    visibleOptions: this.filterVisibleOptions(this.props.options, '')
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.options !== this.props.options) {
      this.setState({
        visibleOptions: this.filterVisibleOptions(nextProps.options, this.state.searchTerm)
      });
    }
  }

  filterVisibleOptions(options, searchTerm) {
    return options.filter(option => option.label.toLowerCase().indexOf(searchTerm) !== -1);
  }

  getSelectedLabel() {
    const {options, value} = this.props;

    const selectedOptions = options.filter(option => option.value === value);
    if (selectedOptions.length) {
      return selectedOptions[0].label;
    }
    return value || '';
  }

  handleVisible = () => {
    if (this.contentRef) {
      this.contentRef.querySelector('.spectrum-Search-input').focus();
    }
  }

  handleSearchChange = searchTerm => {
    const {options} = this.props;

    this.setState({
      searchTerm,
      visibleOptions: this.filterVisibleOptions(options, searchTerm)
    });
  }

  render() {
    const {
      value,
      className,
      manageOrgsUrl,
      onOrgChange,
      ...otherProps
    } = this.props;

    const {
      visibleOptions
    } = this.state;

    return (
      <ShellMenu
        placement="right"
        animateFrom="top"
        target={
          <Button
            variant="minimal"
            className="coral3-Shell-menu-button">
            {this.getSelectedLabel()}
          </Button>
        }
        onVisible={this.handleVisible}
        {...otherProps}>
        <div
          ref={el => {this.contentRef = el; }}
          className={
            classNames(
              'coral3-Shell-orgSwitcher',
              className
            )
          }>
          <Search
            className="coral3-Shell-orgSwitcher-search"
            placeholder="Search Organizations"
            onChange={this.handleSearchChange}
            quiet />

          {
            visibleOptions.length !== 0 &&
            <SelectList
              className="coral3-Shell-orgSwitcher-items"
              value={value}
              options={visibleOptions}
              onChange={onOrgChange} />
          }
          {
            visibleOptions.length === 0 &&
            <div className="coral3-Shell-orgSwitcher-resultMessage">
              <div className="coral3-Shell-orgSwitcher-resultMessage-container">
                <div className="coral-Heading--1 coral3-Shell-orgSwitcher-resultMessage-heading">
                  No organizations found.
                </div>
              </div>
            </div>
          }
          <div className="coral3-Shell-orgSwitcher-footer">
            <Button
              element="a"
              variant="minimal"
              href={manageOrgsUrl}
              block>
              Manage Organizations
            </Button>
          </div>
        </div>
      </ShellMenu>
    );
  }
}

ShellOrgSwitcher.displayName = 'ShellOrgSwitcher';
