import React, { Component } from 'react';
import classNames from 'classnames';


// import './Select.styl';
function isArray(subjectVar) {
  return Object.prototype.toString.call( subjectVar ) === '[object Array]';
}

export default class SelectList extends Component {

  constructor(props, defaultProps) {
    super(props);
    this.state = {
      highlightedOption: {},
      isFocused: false,
      lastSelected: {},
    };
  }

  addSelection = (option)=> {
    return [
      ...this.props.value,
      option.value
    ]
  }

  removeSelection = (option)=> {
    let index = this.props.value.indexOf(option.value);
    return [
      ...this.props.value.slice(0, index),
      ...this.props.value.slice(index+1, this.props.value.length),
    ]
  }

  handleHover = (option)=> {
    this.setState({highlightedOption: option})
  }

  handleFocus = ()=> {
    this.setState({isFocused: true});
  }

  handleBlur = ()=> {
    this.setState({isFocused: false});
  }

  handleSelect = (option)=> {
    let nextState = {
      lastSelected: option
    };
    let nextOptions;
    if ( this.props.multiple ) {
      if ( this.isSelected(option) ) {
        nextOptions = this.removeSelection(option);
      }else {
        nextOptions = this.addSelection(option);
      }
    } else {
      nextOptions = option;
    }
    this.setState({
      lastSelected: option
    });
    if ( this.props.onChange ) {
      this.props.onChange(nextOptions);
    }
  }

  isSelected = (option)=> {
    return this.props.value.indexOf(option.value) >= 0;
  }


  renderListOfOptions = (options)=> {
    const {
      multiple = false,
      value
    } = this.props;
    const {
      highlightedOption,
      lastSelected,
    } = this.state || {};

    return options.map((option)=>{
      const disabled = this.props.disabled || option.disabled;
      let selected = value === option
      selected = multiple ?
        this.isSelected(option) :
        value === option.value;

      let events = {};
      if (!disabled) {
        events.onClick = this.handleSelect.bind(this, option);
        events.onMouseOver = this.handleHover.bind(this, option);
        events.onFocus = this.handleHover.bind(this, option);
      }
      return (
        <div
          key={option.value}
          className={classNames('coral3-SelectList-item', {
            'is-highlighted': highlightedOption === option,
            'is-selected': selected,
            'is-disabled': disabled
          })}
          tabIndex={lastSelected === option ? '0' : '-1'}
          {...events}
          role="option"
          disabled={disabled}
          aria-selected={selected}
          aria-disabled={disabled}>
            {option.label}
        </div>
      );
    })
  }

  renderGroupsOfOptions = (options)=> {
    let optionsWithGroups = [];
    for ( let optionKey in options ) {
      optionsWithGroups.push(<div className="coral-SelectList-group" label={optionKey} role="group" aria-label={optionKey} />)
      optionsWithGroups = [optionsWithGroups, ...this.renderListOfOptions(options[optionKey])]
    }
    return optionsWithGroups;
  }

  render() {
    const {
      options = [],
      className,
      ...otherProps
    } = this.props;
    const {
      isFocused,
    } = this.state || {};
    const containsGroups = !isArray(options);
    return (
      <div
        className={classNames('coral3-SelectList', {'is-focused': isFocused}, className)}
        {...otherProps}
        tabIndex="-1"
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        role="listbox">
        {containsGroups ? this.renderGroupsOfOptions(options) : this.renderListOfOptions(options)}
      </div>
    );
  }
}
SelectList.defaultProps = {value: []};
