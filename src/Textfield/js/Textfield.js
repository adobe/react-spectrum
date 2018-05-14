import autobind from 'autobind-decorator';
import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

importSpectrumCSS('textfield');

@autobind
export default class Textfield extends Component {
  static defaultProps = {
    autoFocus: false,
    disabled: false,
    required: false,
    invalid: false,
    readOnly: false
  };

  componentDidMount() {
    if (this.props.autoFocus) {
      // wait a frame to make sure the textfield in the DOM and focusable
      requestAnimationFrame(() => this.focus());
    }
  }

  focus() {
    if (!this.props.disabled) {
      ReactDOM.findDOMNode(this).focus();
    }
  }

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

    delete otherProps.autoFocus;
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
        disabled={disabled}
        required={required}
        readOnly={readOnly}
        aria-invalid={invalid || null}
        {...filterDOMProps(otherProps)}
        onChange={this.onChange} />
    );
  }
}

Textfield.displayName = 'Textfield';
