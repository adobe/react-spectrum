import classNames from 'classnames';
import React, {Component} from 'react';

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

  getChildProps(button, index) {
    const disabled = this.props.disabled || button.props.disabled || this.props.readOnly;
    return {
      tabIndex: index,
      disabled: disabled,
      variant: 'action',
      quiet: this.props.quiet
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
        aria-readonly={readOnly}
        aria-disabled={disabled}
        aria-selected={selected}
        {...otherProps}
        className={classNames('coral3-ButtonGroup', className)}>
          {this.renderButtons(children)}
      </div>
    );
  }
}
