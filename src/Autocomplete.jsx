import classNames from 'classnames';
import React, { Component } from 'react';
import ReactSelect from 'react-select';
import Tag from './Tag';

import './Autocomplete.styl';

export default class Autocomplete extends Component {
  valueComponent({ value, onClick, onRemove, disabled }) {
    return {
      render() {
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
    };
  }

  render() {
    return (
      <ReactSelect
        { ...this.props }
        className={
          classNames(this.props.className, 'coral-Autocomplete')
        }
        clearable={ false }
        autosize={ false }
        multi={ this.props.multiple || this.props.multi }
        noResultsText={ <em>No matching results.</em> }
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
        valueComponent={ this.props.multiple && this.valueComponent }
      />
    );
  }
}
