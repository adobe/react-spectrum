import React, { Component } from 'react';
import classNames from 'classnames';
import ReactSelect from 'react-select';
import Tag from './Tag';

import './Select.styl';

const KEYPRESS_TIMEOUT_DURATION = 1000;

export default class Select extends Component {
  static defaultProps = {
    variant: 'default', // default, quiet
    multiple: false,
    noResultsText: 'No matching results.',
    placeholder: 'Select one'
  };

  componentWillMount() {
    this.clearState();
  }

  valueComponent({ value, disabled }) {
    return (
      <div
        className="coral3-Select-label"
        disabled={ disabled }
      >
        { value.label }
      </div>
    );
  }

  arrowRenderer() {
    return (
      <span
        className="coral-Icon coral3-Select-openIcon coral-Icon--chevronDown coral-Icon--sizeXXS"
      />
    );
  }

  controlComponent = ({ className, ...otherProps }) => {
    const { disabled, readOnly, variant } = this.props;

    return (
      <button
        tabIndex="0"
        type="button"
        { ...otherProps }
        className={ classNames(
          className,
          'coral3-Select-button',
          'coral-Button',
          'coral-Button--secondary',
          { 'coral-Button--block': variant !== 'quiet' }
        ) }
        disabled={ disabled || readOnly }
      />
    );
  }

  clearState = () => {
    this.setState({
      currentSearch: '',
      clearSearchTimeoutId: 0,
      selectedIndex: -1
    });
  }

  handleKeyPress = (e) => {
    let { currentSearch } = this.state;
    const { clearSearchTimeoutId, selectedIndex } = this.state;
    const options = this.props.options.filter(option => !option.disabled);
    const newSearch = e.key.toLowerCase();

    window.clearTimeout(clearSearchTimeoutId);
    this.setState({
      clearSearchTimeoutId: window.setTimeout(this.clearState, KEYPRESS_TIMEOUT_DURATION)
    });

    const testSearchTerm = (option, term) =>
      option && option.label.trim().toLowerCase().indexOf(term) === 0;

    let start = selectedIndex < 0 ? 0 : selectedIndex;

    // if it's the same key, try to advance one and don't append it to the search term
    if (currentSearch === newSearch) {
      start++;
    } else {
      currentSearch += newSearch;
    }

    let newSelectedIndex = -1;

    for (let i = start; i < options.length; i++) {
      if (testSearchTerm(options[i], currentSearch)) {
        newSelectedIndex = i;
        break;
      }
    }

    if (newSelectedIndex < 0) {
      for (let i = 0; i < start; i++) {
        if (testSearchTerm(options[i], currentSearch)) {
          newSelectedIndex = i;
          break;
        }
      }
    }

    if (newSelectedIndex >= 0) {
      // this is technically not a function we're supposed to call, but it's the
      // same function that would be used if we were to do a menuRenderer
      this.setState({ currentSearch, selectedIndex: newSelectedIndex });
      this.refs.selectComponent.focusOption(options[newSelectedIndex]);
    }
  }

  valuesComponent({ value, onClick, onRemove, disabled }) {
    return (
      <Tag
        onClose={ (e) => onRemove(value, e) }
        closable
        disabled={ disabled }
        onMouseDown={ (e) => onClick(value, e) }
      >
        { value.label }
      </Tag>
    );
  }

  render() {
    const {
      variant,
      noResultsText,
      className,
      multiple,
      multi,
      ...otherProps
    } = this.props;

    const isQuiet = variant === 'quiet';
    const arrowZoneClasses =
      'coral-Icon coral3-Select-openIcon coral-Icon--chevronDown coral-Icon--sizeXXS';
    const multiSelect = multiple || multi;

    return (
      <ReactSelect
        className={
          classNames(className, 'coral3-Select', { 'coral3-Select--quiet': isQuiet })
        }
        multi={ multiSelect }
        noResultsText={ <em>{ noResultsText }</em> }
        arrowRenderer={ this.arrowRenderer }
        controlComponent={ this.controlComponent }
        classAdditions={ {
          'Select-placeholder': 'coral3-Select-label',
          'Select-arrow-zone': arrowZoneClasses,
          'Select-menu-outer': 'coral-Overlay coral3-Select-overlay',
          'Select-menu': 'coral3-SelectList coral3-Select-selectList',
          'Select-option': 'coral3-SelectList-item',
          'Select-values': 'coral-TagList coral-Autocomplete-tagList'
        } }
        valueComponent={ multiSelect ? this.valuesComponent : this.valueComponent }
        clearable={ false }
        autosize={ false }
        searchable={ false }
        tabSelectsValue={ false }
        { ...otherProps }
        onValueClick={ this.props.onValueClick || (() => {}) }
        backspaceToRemoveMessage=""
        onKeyPress={ this.handleKeyPress }
        ref="selectComponent"
      />
    );
  }
}

Select.displayName = 'Select';
