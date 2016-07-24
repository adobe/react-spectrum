import React, { Component } from 'react';
import classNames from 'classnames';

export default class Textfield extends Component {
  static defaultProps = {
    disabled: false,
    required: false,
    invalid: false,
    readOnly: false
  };

  render() {
    const {
      className,
      quiet,
      disabled,
      required,
      invalid,
      readOnly,
      ...otherProps
    } = this.props;

    return (
      <input
        type="text"
        className={
          classNames(
            'coral-Textfield',
            {
              'is-invalid': invalid,
              'coral-Textfield--quiet': quiet
            },
            className
          )
        }
        aria-disabled={ disabled }
        aria-required={ required }
        aria-invalid={ invalid }
        aria-readonly={ readOnly }
        disabled={ disabled }
        required={ required }
        readOnly={ readOnly }
        { ...otherProps }
      />
    );
  }
}
