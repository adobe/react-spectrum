import classNames from 'classnames';
import React, {Component} from 'react';
import ReactSelect from 'react-select';
import Tag from '../../TagList/js/Tag';
import menuRenderer from '../../Select/js/SelectMenuRenderer';

import '../style/index.styl';
import '../../List/style/index.styl';

export default class Autocomplete extends Component {
  static defaultProps = {
    multiple: false,
    multiCloseOnSelect: true,
    allowCreate: false,
    noResultsText: 'No matching results.',
    disabled: false
  };

  arrowRenderer = ({onMouseDown}) => {
    const {disabled} = this.props;

    return (
      <button
        type="button"
        className="coral-Button coral-Button--secondary coral-Button--square
          coral-Autocomplete-trigger"
        onMouseDown={ onMouseDown }
        disabled={ disabled }
      >
        <span className="coral-Icon coral-Icon--chevronDown coral-Icon--sizeXS" />
      </button>
    );
  }

  valuesComponent(props, {value, onClick, onRemove, disabled}) {
    return (
      <Tag
        onClose={ (e) => onRemove(value, e) }
        closable
        disabled={ disabled }
        onMouseDown={ (e) => onClick(value, e) }
      >
        { value[props.labelKey || 'label'] }
      </Tag>
    );
  }

  render() {
    const {
      multiple,
      multi,
      noResultsText,
      className,
      allowCreate,
      onValueClick,
      multiCloseOnSelect,
      ...otherProps
    } = this.props;

    const multiSelect = multiple || multi;
    const SelectComponent = allowCreate ? ReactSelect.Creatable : ReactSelect;

    return (
      <SelectComponent
        className={
          classNames(className, 'coral-Autocomplete')
        }
        arrowRenderer={ this.arrowRenderer }
        menuRenderer={ menuRenderer }
        tabSelectsValue={ false }
        clearable={ false }
        autosize={ false }
        allowCreate={ allowCreate }
        multi={ multiSelect }
        noResultsText={ <em>{ noResultsText }</em> }
        optionClassName="coral-BasicList-item"
        classAdditions={ {
          'Select-control': 'coral-InputGroup coral-InputGroup--block coral-Autocomplete-inputGroup',
          'Select-loading': 'coral-Wait',
          'Select-arrow-zone': 'coral-InputGroup-button',
          'Select-input': 'coral-InputGroup-input coral-DecoratedTextfield',
          'Select-input-icon': 'coral-Icon coral-DecoratedTextfield-icon coral-Autocomplete-icon coral-Icon--sizeXS',
          'Select-input-field': 'coral-DecoratedTextfield-input coral-Autocomplete-input coral-Textfield',
          'Select-menu-outer': 'coral-Overlay',
          'Select-menu': 'coral-BasicList coral-ButtonList coral-Autocomplete-selectList coral-Autocomplete-overlay',
          'Select-values': 'coral-TagList coral-Autocomplete-tagList',
          'Select-noresults': 'coral-BasicList-item coral-ButtonList-item'
        } }
        valueComponent={ multiSelect && this.valuesComponent.bind(this, this.props) }
        multiCloseOnSelect={ multiCloseOnSelect }
        { ...otherProps }
        onValueClick={ onValueClick || (function () {}) }
        backspaceToRemoveMessage=""
      />
    );
  }
}

Autocomplete.displayName = 'Autocomplete';
