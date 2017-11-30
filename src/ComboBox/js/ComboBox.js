import autobind from 'autobind-decorator';
import Autocomplete from '../../Autocomplete';
import Button from '../../Button';
import ChevronDown from '../../Icon/ChevronDown';
import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import React from 'react';
import ReactDOM from 'react-dom';
import Textfield from '../../Textfield';
import '../../InputGroup/style/index.styl';

@autobind
export default class ComboBox extends React.Component {
  static defaultProps = {
    options: [],
    disabled: false,
    required: false,
    invalid: false,
    quiet: false
  };

  onButtonClick() {
    ReactDOM.findDOMNode(this.textfield).focus();
    this.autocomplete.toggleMenu();
  }

  getCompletions(text) {
    return this.props.options.filter(o => o.toLowerCase().startsWith(text.toLowerCase()));
  }

  render() {
    const {
      value,
      disabled,
      required,
      invalid,
      quiet,
      onChange,
      icon,
      ...props
    } = this.props;

    return (
      <Autocomplete
        className={classNames('spectrum-ComboBox', 'spectrum-InputGroup', 'spectrum-DecoratedTextfield', {
          'spectrum-InputGroup--quiet': quiet
        })}
        ref={a => this.autocomplete = a}
        getCompletions={this.getCompletions}
        value={value}
        onChange={onChange}>
        <Textfield
          className={classNames('spectrum-InputGroup-input', 'spectrum-ComboBox-input', {'spectrum-DecoratedTextfield-input': icon})}
          {...props}
          ref={t => this.textfield = t}
          disabled={disabled}
          required={required}
          invalid={invalid}
          autocompleteInput
          quiet={quiet} />

        {cloneIcon(icon, {
          className: 'spectrum-DecoratedTextfield-icon',
          size: 'XS'
        })}

        <Button
          className="spectrum-InputGroup-button"
          type="button"
          variant="dropdown"
          onClick={this.onButtonClick}
          onMouseDown={e => e.preventDefault()}
          disabled={disabled}
          required={required}
          invalid={invalid}
          quiet={quiet}>
          <ChevronDown size="XS" />
        </Button>
      </Autocomplete>
    );
  }
}
