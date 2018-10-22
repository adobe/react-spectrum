import {List, ListItem} from '../../List';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

export default class SelectList extends Component {
  static propTypes = {
    /** Whether the SelectList is disabled */
    disabled: PropTypes.bool,

    /** Whether to show the invalid icon and styling */
    invalid: PropTypes.bool,

    label: PropTypes.string,

    /** Whether multiple options are able to be selected */
    multiple: PropTypes.bool,

    /** Function called when the selected options are changed */
    onChange: PropTypes.func,

    /** Array of strings of options in list */
    options: PropTypes.arrayOf(PropTypes.object),

    /** Whether an input is required */
    required: PropTypes.bool,

    /** Array of pre-selected values*/
    value: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string
    ])
  };

  static defaultProps = {
    options: [],
    multiple: false,
    disabled: false,
    invalid: false,
    required: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    };
  }

  componentWillReceiveProps(props) {
    if (props.value && props.value !== this.state.value) {
      this.setState({
        value: props.value
      });
    }
  }

  addSelection(option) {
    return [
      ...(this.state.value || []),
      option.value
    ];
  }

  removeSelection(option) {
    let value = this.state.value || [];
    const index = value.indexOf(option.value);
    return [
      ...value.slice(0, index),
      ...value.slice(index + 1, value.length)
    ];
  }

  handleSelect(option) {
    let nextOptions;
    if (this.props.multiple) {
      if (this.isSelected(option)) {
        nextOptions = this.removeSelection(option);
      } else {
        nextOptions = this.addSelection(option);
      }
    } else {
      nextOptions = option.value;
    }

    // Set state if in uncontrolled mode
    if (!('value' in this.props)) {
      this.setState({value: nextOptions});
    }

    if (this.props.onChange) {
      this.props.onChange(nextOptions);
    }
  }

  isSelected(option) {
    return this.props.multiple
      ? this.state.value && this.state.value.indexOf(option.value) >= 0
      : this.state.value === option.value;
  }

  renderListOfOptions = (options) => (
    options.map((option, index) => (
      <ListItem
        key={index}
        icon={option.icon}
        selected={this.isSelected(option)}
        disabled={this.props.disabled || option.disabled}
        onSelect={this.handleSelect.bind(this, option)}
        onTab={this.props.onTab}>
        {option.label}
      </ListItem>
    ))
  )

  render() {
    const {
      options = [],
      multiple = false,
      disabled = false,
      invalid = false,
      required = false,
      className,
      ...otherProps
    } = this.props;

    delete otherProps.onTab;

    return (
      <List
        className={className}
        aria-multiselectable={multiple}
        aria-disabled={disabled}
        aria-invalid={invalid}
        aria-required={required}
        selectable
        {...otherProps}>
        {this.renderListOfOptions(options)}
      </List>
    );
  }
}
