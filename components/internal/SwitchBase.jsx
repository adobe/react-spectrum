import React, { Component } from 'react';
import classNames from 'classnames';

export default class SwitchBase extends Component {
  static defaultProps = {
    renderLabel: true,
    defaultChecked: false,
    disabled: false,
    required: false,
    invalid: false,
    readOnly: false,
    onChange: () => {}
  };

  constructor(props) {
    super(props);

    const {
      checked,
      defaultChecked
    } = props;

    this.state = {
      checked: checked !== undefined ? checked : defaultChecked
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
    return this.refs.input;
  }

  handleChange = e => {
    const { onChange } = this.props;
    const { checked } = e.target;

    this.setChecked(checked);
    onChange(e, checked);
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
      onChange,
      onBlur,
      onFocus,
      ...rest
    } = this.props;
    const { checked } = this.state;

    return (
      <div
        className={
          classNames(
            className,
            { 'is-invalid': invalid }
          )
        }
        required={ required ? true : null }
        aria-disabled={ disabled }
        aria-required={ required }
        aria-invalid={ invalid }
        aria-readonly={ readOnly }
        aria-checked={ checked }
        { ...rest }
      >
        <input
          ref="input"
          type={ inputType }
          className={ inputClassName }
          defaultChecked={ defaultChecked }
          checked={ checked }
          disabled={ disabled }
          required={ required }
          name={ name ? name : null }
          value={ value ? value : null }
          required={ required ? true : null }
          readonly={ readOnly ? true : null }
          onChange={ this.handleChange }
          onBlur={ onBlur }
          onFocus={ onFocus }
        />
        <span className={ markClassName } />
        {
          renderLabel &&
          <label className={ labelClassName }>
            { label }
            { children }
          </label>
        }
      </div>
    );
  }
}
