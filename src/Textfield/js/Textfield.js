import autobind from 'autobind-decorator';
import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

importSpectrumCSS('textfield');

@autobind
export default class Textfield extends Component {
  static propTypes = {
    /** Whether to automatically focus this text field */
    autoFocus: PropTypes.bool,
  
    /** Custom CSS class to add to the text field */
    className: PropTypes.string,
    
    /** Whether to disable the text field */
    disabled: PropTypes.bool,
  
    /** Whether to show the warning icon and red border. DEPRECATED: use validationState instead */
    invalid: PropTypes.bool,
  
    /** Function called when focus is taken away from the text field */
    onBlur: PropTypes.func,
  
    /** Function called when the text field value is changed */
    onChange: PropTypes.func,
  
    /** Function called when focus is put on the text field */
    onFocus: PropTypes.func,
    
    /** String to show in the text field when nothing has been input */
    placeholder: PropTypes.string,
    
    /** Whether the text field should render using a quiet variant */
    quiet: PropTypes.bool,
    
    /** Whether the text field can only be read */
    readOnly: PropTypes.bool,
    
    /** Whether the text field requires user input (shows warning if empty) */
    required: PropTypes.bool,

    /** Show either checkmark or warning icons */
    validationState: PropTypes.oneOf(['valid', 'invalid'])
  };
  
  static defaultProps = {
    autoFocus: false,
    disabled: false,
    quiet: false,
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
      validationState,
      ...otherProps
    } = this.props;

    var Tag = multiLine ? 'textarea' : 'input';

    const isInvalid = invalid || validationState === 'invalid';

    delete otherProps.autoFocus;
    delete otherProps.autocompleteInput;

    if (invalid) {
      console.warn('The "invalid" prop of Textfield is deprecated. Please use validationState="invalid" instead.');
    }

    return (
      <Tag
        type="text"
        className={
          classNames(
            'spectrum-Textfield',
            {
              'spectrum-Textfield--multiline': multiLine,
              'is-invalid': isInvalid,
              'is-valid': validationState === 'valid',
              'spectrum-Textfield--quiet': quiet
            },
            className
          )
        }
        disabled={disabled}
        required={required}
        readOnly={readOnly}
        aria-invalid={isInvalid || null}
        {...filterDOMProps(otherProps)}
        onChange={this.onChange} />
    );
  }
}

Textfield.displayName = 'Textfield';
