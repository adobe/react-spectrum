import Button from '../../Button';
import classNames from 'classnames';
import HelpOutline from '../../Icon/HelpOutline';
import {List, ListItem} from '../../List';
import React, {Component} from 'react';
import Search from '../../Search';
import ShellMenu from './ShellMenu';
import Wait from '../../Wait';
import '../style/ShellHelp.styl';

export default class ShellHelp extends Component {
  static defaultProps = {
    defaultResults: [],
    onSearch: function () {},
    onChange: function () {},
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

  handleVisible = () => {
    if (this.contentRef) {
      this.contentRef.querySelector('.coral-Search-input').focus();
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
      <List className="coral3-Shell-help-results">
        {
          numTotalResults !== 0 && searchResults && searchResults.length
          ? searchResults.map(({tags, title, href}, index) => (
            <ListItem
              key={href}
              element="a"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              label={
                <span>
                  {title}
                  <div className="coral3-Shell-help-result-description">
                    {tags.join(separator)}
                  </div>
                </span>
                } />
            )).concat(
              <ListItem
                element="a"
                key="all-results"
                className="spectrum-Link coral3-Shell-help-allResults"
                href={`${moreSearchResultsUrl}?q=${searchTerm}`}
                target="_blank"
                rel="noopener noreferrer"
                label={`See all ${numTotalResults} results`} />
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
          defaultResults && defaultResults.length ?
          defaultResults.map(({href, icon, label}, index) => (
            <ListItem
              key={index}
              element="a"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="coral3-Shell-help-item"
              icon={icon}
              label={label} />
          )) : null
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
            icon={<HelpOutline />}
            square />
        }
        onVisible={this.handleVisible}
        onHidden={this.props.onHide}
        {...otherProps}>
        <div
          ref={el => {this.contentRef = el; }}
          className={
            classNames(
              'coral3-Shell-help',
              className
            )
          }>
          <Search
            className="coral3-Shell-help-search"
            placeholder="Search Help"
            onSubmit={this.handleSearch}
            onChange={this.props.onChange}
            quiet />
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
