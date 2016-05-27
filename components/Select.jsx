import React, { Component } from 'react';
import classNames from 'classnames';
import ReactSelect from 'react-select';
import Tag from './Tag';

import './Select.styl';

export default class Select extends Component {

  constructor(props) {
    super(props);
  }

  valuesComponent({value, onClick, onRemove, disabled}) {
    return {
      render(){
        return (
          <Tag
            onClose={(e)=> onRemove(value, e)}
            closable
            disabled={disabled}
            onMouseDown={(e)=> onClick(value, e)}>
            {value.label}
          </Tag>
        )
      }
    }
  }

  valueComponent({value, disabled}) {
    return {
      render(){
        return (
          <div className="coral3-Select-label"
            closable
            disabled={disabled}
            >
            {value.label}
          </div>
        )
      }
    }
  }

  arrowRenderer(handleMouseDownOnArrow, props) {
    return (
      <span className="coral-Icon coral3-Select-openIcon coral-Icon--chevronDown coral-Icon--sizeXXS"></span>
    );
  }

  controlComponent(props) {
    return (
      <button
        tabIndex="0"
        {...props}
        className={classNames(
          props.className,
          'coral-Button',
          'coral-Button--secondary',
          {'coral-Button--block': props.variant !== 'quiet'}
        )}
        disabled={props.disabled || props.readOnly} >
        {props.children}
      </button>
    );
  }

  render() {
    return (
      <ReactSelect
        className={classNames('coral3-Select', { 'coral3-Select--quiet': this.props.variant === 'quiet' } )}
        multi={this.props.multiple || this.props.multi}
        noResultsText={<em>No matching results.</em>}
        arrowRenderer={this.arrowRenderer}
        controlComponent={this.controlComponent}
        classAdditions={{
          'Select-placeholder': 'coral3-Select-label',
          'Select-arrow-zone': 'coral-Icon coral3-Select-openIcon coral-Icon--chevronDown coral-Icon--sizeXXS',
          'Select-menu-outer': 'coral-Overlay coral3-Select-overlay',
          'Select-menu': 'coral3-SelectList coral3-Select-selectList',
          'Select-option': 'coral3-SelectList-item',
          'Select-values': 'coral-TagList coral-Autocomplete-tagList'
        }}
        valueComponent={this.props.multiple ? this.valuesComponent : this.valueComponent}
        {...this.props}
        clearable={false}
        autosize={false}
        searchable={false}/>
    );
  }
}
