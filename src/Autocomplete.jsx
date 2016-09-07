import classNames from 'classnames';
import React, { Component } from 'react';
import ReactSelect from 'react-select';
import Tag from './Tag';

import './Autocomplete.styl';

export default class Autocomplete extends Component {
  static defaultProps = {
    multiple: false,
    allowCreate: false,
    noResultsText: 'No matching results.'
  };

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

  filterOptions(options, filter, selectedValues) {
    // For single autocompletes, selectedValues is always null.
    const values = selectedValues || [];

    // Filter already selected values
    let filteredOptions = options.filter(option => values.indexOf(option) === -1);

    // Filter by label
    if (filter != null && filter.length > 0) {
      filteredOptions =
        filteredOptions.filter(option => RegExp(filter, 'ig').test(option[this.props.labelKey]));
    }

    // Append Addition option
    if (filteredOptions.length === 0) {
      filteredOptions.push({
        label: filter,
        value: filter,
        create: true
      });
    }

    return filteredOptions;
  }

  render() {
    const {
      multiple,
      multi,
      noResultsText,
      className,
      allowCreate,
      ...otherProps
    } = this.props;

    const multiSelect = multiple || multi;

    // We could have added the filterOptions as a prop on the ReactSelectComponent. Something like:
    // <ReactSelect
    //    ...
    //    filterOptions={ allowCreate && this.filterOptions }
    //    { ...otherProps }
    //    ...
    // But doing this, would break the functionality of react-select that shows an no results text
    // when the value typed does not match any of the available options. This functionality breaks
    // also if you set filterOptions to null
    // (filterOptions={ allowCreate ? this.filterOptions : null}).
    if (allowCreate) {
      otherProps.filterOptions = this.filterOptions;
    }

    return (
      <ReactSelect
        className={
          classNames(className, 'coral-Autocomplete')
        }
        tabSelectsValue={ false }
        clearable={ false }
        autosize={ false }
        multi={ multiSelect }
        noResultsText={ <em>{ noResultsText }</em> }
        classAdditions={ {
          'Select-control':
            'coral-InputGroup coral-InputGroup--block coral-Autocomplete-inputGroup',
          'Select-loading': 'coral-Wait',
          'Select-input': 'coral-InputGroup-input coral-DecoratedTextfield',
          'Select-input-icon':
            'coral-Icon coral-DecoratedTextfield-icon coral-Autocomplete-icon coral-Icon--sizeXS',
          'Select-input-field':
            'coral-DecoratedTextfield-input coral-Autocomplete-input coral-Textfield',
          'Select-arrow-zone': 'coral-InputGroup-button',
          'Select-arrow':
            'coral-Button coral-Button--secondary coral-Button--square coral-Autocomplete-trigger',
          'Select-arrow-icon': 'coral-Icon coral-Icon--chevronDown coral-Icon--sizeXS',
          'Select-menu-outer': 'coral-Overlay coral-Autocomplete-overlay',
          'Select-menu': 'coral-BasicList coral-ButtonList coral-Autocomplete-selectList',
          'Select-option': 'coral-BasicList-item coral-ButtonList-item',
          'Select-values': 'coral-TagList coral-Autocomplete-tagList',
          'Select-noresults': 'coral-BasicList-item coral-ButtonList-item'
        } }
        valueComponent={ multiSelect && this.valuesComponent }
        { ...otherProps }
        onValueClick={ this.props.onValueClick || (() => {}) }
        backspaceToRemoveMessage=""
      />
    );
  }
}

Autocomplete.displayName = 'Autocomplete';
