import React, {Component} from 'react';
import classNames from 'classnames';
import '../style/index.styl';

export default class ButtonGroup extends Component {
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

  addSelection(button) {
    return [
      ...(this.state.value || []),
      button.value
    ];
  }

  removeSelection(button) {
    let value = this.state.value || [];
    const index = value.indexOf(button.value);
    return [
      ...value.slice(0, index),
      ...value.slice(index + 1, value.length)
    ];
  }

  handleSelect(button) {
    let nextButtons;
    if (this.props.multiple) {
      if (this.isSelected(button)) {
        nextButtons = this.removeSelection(button);
      } else {
        nextButtons = this.addSelection(button);
      }
    } else {
      nextButtons = button.value;
    }

    // Set state if in uncontrolled mode
    if (!('value' in this.props)) {
      this.setState({value: nextButtons});
    }

    if (this.props.onClick) {
      this.props.onClick(nextButtons);
    }
  }

  isSelected(button) {
    return this.props.multiple
      ? this.state.value && this.state.value.indexOf(button.value) >= 0
      : this.state.value === button.value;
  }

  getChildProps(button, index) {
    const disabled = this.props.disabled || button.props.disabled || this.props.readOnly;

    return {
      tabIndex: index,
      className: classNames('coral3-ButtonGroup-item', button.props.className),
      selected: this.isSelected(button.props),
      disabled: disabled,
      variant: this.props.quiet ? 'quiet' : (disabled ? 'secondary' : ''),
      onClick: this.handleSelect.bind(this, button.props)
    };
  }

	renderButtons() {
    const {children} = this.props;
    return React.Children.map(children, (child, index) =>
      child ? React.cloneElement(child, this.getChildProps(child, index)) : null
    );
  }

  render() {
    const {
      children = [],
      className,
      multiple = false,
      disabled = false,
      selected = false,
      readOnly = false,
      invalid = false,
      required = false,
      ...otherProps
    } = this.props;

    delete otherProps.onClick;

    return (
      <div
        aria-multiselectable={multiple}
        aria-invalid={invalid}
        aria-required={required}
        aria-readOnly={readOnly}
        aria-disabled={disabled}
        aria-selected={selected}
        {...otherProps}
        className={classNames('coral3-ButtonGroup', className)}>
          {this.renderButtons(children)}
      </div>
	  );
  }
}
