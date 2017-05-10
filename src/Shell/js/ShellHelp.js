import React, {Component} from 'react';
import classNames from 'classnames';
import ShellMenu from './ShellMenu';

import Search from '../../Search';
import Button from '../../Button';
import {List, ListItem} from '../../List';
import Wait from '../../Wait';

import '../style/ShellHelp.styl';

export default class ShellHelp extends Component {
  static defaultProps = {
    defaultResults: [
      {href: '/learn', icon: 'globe', label: 'Marketing Cloud Help'},
      {href: '/community', icon: 'users', label: 'Community'},
      {href: '/customercare', icon: 'callCenter', label: 'Customer Care'},
      {href: '/status', icon: 'servers', label: 'Adobe Marketing Cloud Status'}
    ],
    onSearch: function () {},
    onClear: function () {},
    onHide: function () {}
  };

  state = {
    searchTerm: ''
  };

  handleSearch = val => {
    const {onSearch} = this.props;
    onSearch(val);
    this.setState({
      searchTerm: val
    });
  }

  handleClear = () => {
    const {onClear} = this.props;
    onClear();
    this.setState({
      searchTerm: ''
    });
  }

  handleVisible = () => {
    if (this.refs) {
      this.refs.content.querySelector('.coral-Search-input').focus();
    }
  }

  renderResults() {
    const {searchResults} = this.props;
    if (searchResults) {
      return this.renderSearchResults();
    }
    return this.renderDefaultResults();
  }

  renderSearchResults() {
    const {
      searchResults,
      numTotalResults,
      moreSearchResultsUrl
    } = this.props;

    const {searchTerm} = this.state;

    // https://git.corp.adobe.com/React/react-coral/issues/134
    // unicode for: '&nbsp; &bull; &nbsp';
    const separator = '\u00a0 \u2022 \u00a0';

    return (
      <List className="coral-BasicList coral-AnchorList coral3-Shell-help-results">
        {
          numTotalResults !== 0 && searchResults && searchResults.length
          ? searchResults.map(({tags, title, href}, index) => (
              <ListItem
                key={ href }
                element="a"
                href={ href }
                className="coral-AnchorList-item"
                target="undefined"
                label={
                  <span>
                    { title }
                    <div className="coral3-Shell-help-result-description">
                      { tags.join(separator) }
                    </div>
                  </span>
                }
              />
            )).concat(
              <ListItem
                element="a"
                key="all-results"
                className="coral-AnchorList-item coral-Link coral3-Shell-help-allResults"
                href={ `${ moreSearchResultsUrl }?q=${ searchTerm }` }
                label={ `See all ${ numTotalResults } results` }
                target="undefined"
              />
            )
          : <div className="coral3-Shell-help-resultMessage">
              <div className="coral3-Shell-help-resultMessage-container">
                <div className="coral-Heading--1 coral3-Shell-help-resultMessage-heading">
                  No results found
                </div>
              </div>
            </div>
        }
      </List>
    );
  }

  renderDefaultResults() {
    const {defaultResults} = this.props;

    return (
      <List className="coral3-Shell-help-items">
        {
          defaultResults && defaultResults.length &&
          defaultResults.map(({href, icon, label}, index) => (
            <ListItem
              key={ index }
              element="a"
              href={ href }
              className="coral-AnchorList-item coral3-Shell-help-item"
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
      className,
      loading,
      ...otherProps
    } = this.props;

    return (
      <ShellMenu
        placement="right"
        animateFrom="top"
        target={
          <Button
            className="coral3-Shell-menu-button"
            variant="minimal"
            icon="helpCircle"
            square
          />
        }
        onVisible={ this.handleVisible }
        onHidden={ this.props.onHide }
        { ...otherProps }
      >
        <div
          ref="content"
          className={
            classNames(
              'coral-BasicList',
              'coral-AnchorList coral3-Shell-help',
              className
            )
          }
        >
          <label className="u-coral-screenReaderOnly">Search Help</label>
          <Search
            className="coral3-Shell-help-search"
            placeholder="Search Help"
            onSubmit={ this.handleSearch }
            onClear={ this.handleClear }
            quiet
          />
          {
            loading
            ? <div className="coral3-Shell-help-loading">
                <Wait className="coral3-Shell-help-loading-wait" />
                <span className="coral-Heading--2 coral3-Shell-help-loading-info">
                  Searching Help...
                </span>
              </div>
            : this.renderResults()
          }
        </div>
      </ShellMenu>
    );
  }
}

ShellHelp.displayName = 'ShellHelp';
