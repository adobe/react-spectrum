import autobind from 'autobind-decorator';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Textfield from '../Textfield';

@autobind
export default class Textarea extends Component {
  static propTypes = {
    /** Custom CSS class to add to the textarea */
    className: PropTypes.string,

    /** Whether to disable the textarea */
    disabled: PropTypes.bool,

    /** Whether to show the warning icon and red border */
    invalid: PropTypes.bool,

    /** Function called when focus is taken away from the textarea */
    onBlur: PropTypes.func,

    /** Function called when the textarea value is changed */
    onChange: PropTypes.func,

    /** Function called when focus is put on the textarea */
    onFocus: PropTypes.func,

    /** String to show in the textarea when nothing has been input */
    placeholder: PropTypes.string,

    /** Whether the textarea should render using a quiet variant */
    quiet: PropTypes.bool,

    /** Whether the textarea can only be read */
    readOnly: PropTypes.bool,

    /** Whether the textarea requires user input (shows warning if empty) */
    required: PropTypes.bool
  };

  static defaultProps = {
    disabled: false,
    invalid: false,
    quiet: false,
    readOnly: false,
    required: false
  };

  handleHeightChange(value, e) {
    const {
      quiet,
      onChange
    } = this.props;

    if (typeof onChange === 'function') {
      onChange(value, e);
    }

    if (quiet) {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  }

  render() {
    const {
      quiet,
      ...otherProps
    } = this.props;

    return (
      <Textfield
        {...otherProps}
        multiLine
        quiet={quiet}
        onChange={this.handleHeightChange} />
    );
  }
}
