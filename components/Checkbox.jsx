import React, { Component } from 'react';
import classNames from 'classnames';

export default class Checkbox extends Component {
  static defaultProps = {
    defaultChecked: false,
    indeterminate: false,
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

  componentDidMount() {
    this.setIndeterminate();
  }

  componentWillReceiveProps(nextProps) {
    if ('checked' in nextProps) {
      this.setState({
        checked: nextProps.checked
      });
    }
  }

  componentDidUpdate() {
    this.setIndeterminate();
  }

  // There is no way to set indeterminate through markup such that it will be picked up by a CSS
  // indeterminate pseudo-selector. It can only be done via javascript.
  setIndeterminate() {
    const { indeterminate } = this.props;
    if (indeterminate) {
      this.refs.input.indeterminate = true;
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
      indeterminate,
      disabled,
      required,
      invalid,
      readOnly,
      className,
      children,
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
            'coral-Checkbox',
            { 'is-invalid': invalid },
            className
          )
        }
        required={ required ? true : null }
        aria-disabled={ disabled }
        aria-required={ required }
        aria-invalid={ invalid }
        aria-readonly={ readOnly }
        { ...rest }
      >
        <input
          ref="input"
          type="checkbox"
          className="coral-Checkbox-input"
          defaultChecked={ defaultChecked }
          checked={ checked }
          disabled={ disabled }
          required={ required }
          name={ name ? name : null }
          value={ value ? value : null }
          required={ required ? true : null }
          aria-checked={ indeterminate ? 'mixed' : checked }
          onChange={ this.handleChange }
          onBlur={ onBlur }
          onFocus={ onFocus }
        />
        <span className="coral-Checkbox-checkmark" />
        <label className="coral-Checkbox-description">
          { label }
          { children }
        </label>
      </div>
    );
  }
}
