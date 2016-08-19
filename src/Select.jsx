import React, { Component } from 'react';
import classNames from 'classnames';
import ReactSelect from 'react-select';
import Tag from './Tag';

import './Select.styl';

export default class Select extends Component {
  static defaultProps = {
    variant: 'default', // default, quiet
    multiple: false,
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
      />
    );
  }
}
