import React, { Component } from 'react';
import classNames from 'classnames';
import ShellMenu from './ShellMenu';

import Search from '../Search';
import Button from '../Button';
import Icon from '../Icon';

import './ShellHelp.styl';

export default class ShellHelp extends Component {
  static defaultProps = {
    defaultResults: [
        { href: '/learn', icon: 'globe', label: 'Marketing Cloud Help' },
        { href: '/community', icon: 'users', label: 'Community' },
        { href: '/customercare', icon: 'callCenter', label: 'Customer Care' },
        { href: '/status', icon: 'servers', label: 'Adobe Marketing Cloud Status' }
      ],
    onSearch: () => {}
  };

  handleSearch = val => {
    const { onSearch } = this.props;
    onSearch(val);
  }

  render() {
    const {
      defaultResults,
      searchResults,
      moreSearchResultsUrl,
      className,
      ...otherProps
    } = this.props;

    return (
      <ShellMenu
        placement="right"
        animateFrom="top"
        target={ <Button variant="minimal" className="coral-Shell-menu-button" icon="helpCircle" square /> }
        { ...otherProps }
      >
        <div className='coral-BasicList coral-AnchorList coral-Shell-help'>
          <label className="u-coral-screenReaderOnly">Search Help</label>
          <Search
            className="coral-Shell-help-search"
            placeholder="Search Help"
            onSubmit={ this.handleSearch }
            quiet
          />
          {
            searchResults
            ?
            null
            :
            <div className="coral-Shell-help-items">
              {
                defaultResults && defaultResults.length &&
                defaultResults.map(({ href, icon, label }, index) => (
                  <HelpItem key={ index } url={ href } icon={ icon }>{ label }</HelpItem>
                ))
              }
            </div>
          }
        </div>
      </ShellMenu>
    );
  }
}

const HelpItem = ({ url, icon, children }) => (
  <a href={ url } className="coral-BasicList-item coral-AnchorList-item coral-Shell-help-item">
    <Icon icon={ icon } className="coral-BasicList-item-icon" />
    <div className="coral-BasicList-item-outerContainer">
      <div className="coral-BasicList-item-contentContainer">
        <div className="coral-BasicList-item-content">{ children }</div>
      </div>
    </div>
  </a>
);
