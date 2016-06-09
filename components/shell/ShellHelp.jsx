import React, { Component } from 'react';
import classNames from 'classnames';
import ShellMenu from './ShellMenu';

import Search from '../Search';
import Button from '../Button';
import List from '../List';
import ListItem from '../ListItem';
import Wait from '../Wait';

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

  state = {
    searchTerm: ''
  };

  handleSearch = val => {
    const { onSearch } = this.props;
    onSearch(val);
    this.setState({
      searchTerm: val
    });
  }

  handleVisible = () => {
    if (this.refs) {
      this.refs.content.querySelector('.coral-Search-input').focus();
    }
  }

  renderSearchResults(searchResults, numTotalResults, moreSearchResultsUrl, searchTerm) {
    return (
      <List className="coral-BasicList coral-AnchorList coral-Shell-help-results">
        {
          numTotalResults !== 0 && searchResults && searchResults.length
          ? searchResults.map(({ tags, label, href }, index) => (
              <ListItem
                key={ index }
                element="a"
                href={ href }
                className="coral-AnchorList-item"
                target="undefined"
                label={
                  <span>
                    { label }
                    <div className="coral-Shell-help-result-description">{ tags.join('&nbsp; &bull; &nbsp;') }</div>
                  </span>
                }
              />
            )).concat(
              <ListItem
                element="a"
                className="coral-AnchorList-item coral-Link coral-Shell-help-allResults"
                href={ `${ moreSearchResultsUrl }?q=${ searchTerm }` }
                label={ `See all ${ numTotalResults } results`}
                target="undefined"
              />
            )
          : <div className="coral-Shell-help-resultMessage">
              <div className="coral-Shell-help-resultMessage-container">
                <div className="coral-Heading--1 coral-Shell-help-resultMessage-heading">
                  No results found
                </div>
              </div>
            </div>
        }
      </List>
    )
  }

  renderDefaultResults(defaultResults) {
    return (
      <List className="coral-Shell-help-items">
        {
          defaultResults && defaultResults.length &&
          defaultResults.map(({ href, icon, label }, index) => (
            <ListItem
              element="a"
              href={ href }
              className="coral-AnchorList-item coral-Shell-help-item"
              icon={ icon }
              iconSize="S"
              label={ label }
            />
          ))
        }
      </List>
    );
  }

  render() {
    const {
      defaultResults,
      searchResults,
      numTotalResults,
      moreSearchResultsUrl,
      className,
      loading,
      ...otherProps
    } = this.props;

    const { searchTerm } = this.state;
    const listItemFocusProps = {
      onFocusNext: this.handleFocusNext,
      onFocusPrevious: this.handleFocusPrevious,
      onFocusFirst: this.handleFocusFirst,
      onFocusLast: this.handleFocusLast
    };

    return (
      <ShellMenu
        placement="right"
        animateFrom="top"
        target={ <Button variant="minimal" className="coral-Shell-menu-button" icon="helpCircle" square /> }
        onVisible={ this.handleVisible }
        { ...otherProps }
      >
        <div className='coral-BasicList coral-AnchorList coral-Shell-help' ref="content">
          <label className="u-coral-screenReaderOnly">Search Help</label>
          <Search
            className="coral-Shell-help-search"
            placeholder="Search Help"
            onSubmit={ this.handleSearch }
            quiet
          />
          {
            loading
            ? <div className="coral-Shell-help-loading">
                <Wait className="coral-Shell-help-loading-wait" />
                <span className="coral-Heading--2 coral-Shell-help-loading-info">Searching Help...</span>
              </div>
            : searchResults
            ? this.renderSearchResults(searchResults, numTotalResults, moreSearchResultsUrl, searchTerm, listItemFocusProps)
            : this.renderDefaultResults(defaultResults, listItemFocusProps)
          }
        </div>
      </ShellMenu>
    );
  }
}
