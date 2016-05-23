import React, { Component } from 'react';
import classNames from 'classnames';

export default class Radio extends Component {
  static defaultProps = {
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
    }
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
      onChange,
      onBlur,
      onFocus,
      ...otherProps
    } = this.props;
    const { checked } = this.state;

    return (
      <div
        className={
          classNames(
            'coral-Radio',
            { 'is-invalid': invalid },
            className
          )
        }
        required={ required ? true : null }
        aria-disabled={ disabled }
        aria-required={ required }
        aria-invalid={ invalid }
        aria-readonly={ readOnly }
        { ...otherProps }
      >
        <input
          ref="input"
          type="radio"
          className="coral-Radio-input"
          defaultChecked={ defaultChecked }
          checked={ checked }
          disabled={ disabled }
          required={ required }
          name={ name ? name : null }
          value={ value ? value : null }
          required={ required ? true : null }
          aria-checked={ checked }
          onChange={ this.handleChange }
          onBlur={ onBlur }
          onFocus={ onFocus }
        />
        <span className="coral-Radio-checkmark" />
        <label className="coral-Radio-description">
          { label }
          { children }
        </label>
      </div>
    );
  }
}
