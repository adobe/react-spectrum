import classNames from 'classnames';
import React, {Component} from 'react';

export default class SwitchBase extends Component {
  static defaultProps = {
    renderLabel: true,
    // defaultChecked is undefined by default so we can repect
    // the value that is passed in without erroneously putting
    // both checked and defaultChecked on the input
    defaultChecked: undefined,
    disabled: false,
    required: false,
    invalid: false,
    readOnly: false,
    onChange: function () {}
  };

  constructor(props) {
    super(props);

    const {
      checked,
      defaultChecked
    } = props;

    this.state = {
      checked: checked !== undefined ? checked : defaultChecked || false
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('checked' in nextProps) {
      this.setState({
        checked: nextProps.checked
      });
    }
  }

  setChecked(checked) {
    if (!('checked' in this.props)) {
      this.setState({
        checked
      });
    }
  }

  getInput() {
    return this.inputRef;
  }

  handleChange = e => {
    const {onChange} = this.props;
    const {checked} = e.target;

    this.setChecked(checked);
    onChange(checked, e);
  }

  render() {
    const {
      defaultChecked,
      label,
      value,
      name,
      disabled,
      required,
      invalid,
      readOnly,
      className,
      children,
      inputType,
      renderLabel,
      inputClassName,
      markClassName,
      labelClassName,
      onBlur,
      onFocus,
      ...otherProps
    } = this.props;
    const {checked} = this.state;
    const shouldRenderLabel = renderLabel && (label || children);

    // Don't let native browser change events bubble up to the root div.
    // Otherwise we double dispatch.
    delete otherProps.onChange;

    return (
      <div
        className={
          classNames(
            className,
            {'is-invalid': invalid, 'is-disabled': disabled}
          )
        }
        required={required ? true : null}
        aria-disabled={disabled}
        aria-required={required}
        aria-invalid={invalid}
        aria-readonly={readOnly}
        aria-checked={checked}
        {...otherProps}>
        <input
          ref={el => {this.inputRef = el; }}
          type={inputType}
          className={inputClassName}
          defaultChecked={defaultChecked}
          checked={checked}
          disabled={disabled}
          name={name}
          value={value}
          required={required ? true : null}
          readOnly={readOnly}
          onChange={this.handleChange}
          onBlur={onBlur}
          onFocus={onFocus} />
        <span className={markClassName} />
        {
          shouldRenderLabel &&
          <label className={labelClassName} >
            {label}
            {children}
          </label>
        }
      </div>
    );
  }
}

SwitchBase.displayName = 'SwitchBase';
