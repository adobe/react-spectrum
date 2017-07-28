import autobind from 'autobind-decorator';
import Autocomplete from '../../Autocomplete';
import Button from '../../Button';
import classNames from 'classnames';
import Icon from '../../Icon';
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
        className={classNames('coral-ComboBox', 'coral-InputGroup', 'spectrum-DecoratedTextfield', {
          'coral-InputGroup--quiet': quiet,
          'is-disabled': disabled,
          'is-invalid': invalid
        })}
        ref={a => this.autocomplete = a}
        getCompletions={this.getCompletions}
        value={value}
        onChange={onChange}>
          <Textfield
            className={classNames('coral-InputGroup-input', 'coral-ComboBox-input', {'spectrum-DecoratedTextfield-input': icon})}
            {...props}
            ref={t => this.textfield = t}
            disabled={disabled}
            required={required}
            invalid={invalid}
            autocompleteInput
            quiet={quiet} />

          {icon &&
            <Icon className="spectrum-DecoratedTextfield-icon" icon={icon} size="XS" />
          }

          <Button
            className="coral-InputGroup-button"
            square
            onClick={this.onButtonClick}
            onMouseDown={e => e.preventDefault()}
            disabled={disabled}
            required={required}
            quiet={quiet}>
              <Icon icon="chevronDown" size="XS" />
          </Button>
      </Autocomplete>
    );
  }
}
