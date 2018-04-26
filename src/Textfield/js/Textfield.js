import autobind from 'autobind-decorator';
import classNames from 'classnames';
import React, {Component} from 'react';

importSpectrumCSS('textfield');

@autobind
export default class Textfield extends Component {
  static defaultProps = {
    disabled: false,
    required: false,
    invalid: false,
    readOnly: false
  };

  onChange(e) {
    if (this.props.onChange) {
      this.props.onChange(e.target.value, e);
    }
  }

  render() {
    const {
      className,
      quiet,
      disabled,
      required,
      invalid,
      readOnly,
      multiLine,
      ...otherProps
    } = this.props;

    var Tag = multiLine ? 'textarea' : 'input';

    delete otherProps.autocompleteInput;

    return (
      <Tag
        type="text"
        className={
          classNames(
            'spectrum-Textfield',
            {
              'spectrum-Textfield--multiline': multiLine,
              'is-invalid': invalid,
              'spectrum-Textfield--quiet': quiet
            },
            className
          )
        }
        aria-disabled={disabled}
        aria-required={required}
        aria-invalid={invalid}
        aria-readonly={readOnly}
        disabled={disabled}
        required={required}
        readOnly={readOnly}
        {...otherProps}
        onChange={this.onChange} />
    );
  }
}

Textfield.displayName = 'Textfield';
