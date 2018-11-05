import autobind from 'autobind-decorator';
import Autocomplete from '../../Autocomplete';
import Button from '../../Button';
import {chain} from '../../utils/events';
import ChevronDownMedium from '../../Icon/core/ChevronDownMedium';
import classNames from 'classnames';
import createId from '../../utils/createId';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import React from 'react';
import Textfield from '../../Textfield';

importSpectrumCSS('inputgroup');

const getLabel = o => (typeof o === 'string' ? o : o.label);
const formatMessage = messageFormatter(intlMessages);

@autobind
export default class ComboBox extends React.Component {
  static defaultProps = {
    options: [],
    disabled: false,
    required: false,
    invalid: false,
    quiet: false
  };

  state = {
    open: false,
    count: null
  };

  constructor(props) {
    super(props);
    this.comboBoxId = createId();
  }

  onButtonClick() {
    this.textfield.focus();
    this.autocomplete.toggleMenu();
  }

  getCompletions(text) {
    if (this.shouldFilter(text)) {
      // show options that start with the text first, then
      // show other options containing the text
      return this.props.options
        .filter(option => getLabel(option).toLowerCase().includes(text.toLowerCase()))
        .sort((a, b) => {
          const aStartsWithText = getLabel(a).toLowerCase().startsWith(text.toLowerCase());
          const bStartsWithText = getLabel(b).toLowerCase().startsWith(text.toLowerCase());

          if (aStartsWithText && !bStartsWithText) {
            return -1;
          }

          if (!aStartsWithText && bStartsWithText) {
            return 1;
          }

          return 0;
        });
    }

    return this.props.options;
  }

  shouldFilter(text) {
    // if any input has been made since we opened the menu, let's filter
    if (this.changeSinceOpen) {
      return true;
    }

    // if the current value isn't in the list, let's filter
    return !this.props.options.some(o => getLabel(o) === text);
  }

  onMenuShow() {
    this.setState({open: true});
  }

  onMenuHide() {
    this.changeSinceOpen = false;
    this.setState({open: false});
  }

  onChange(value) {
    this.changeSinceOpen = true;
    const count = value ? this.getCompletions(value).length : null;
    this.setState({count});
  }

  getButtonLabel() {
    const {options} = this.props;
    let {count} = this.state;
    let key = 'Show suggestions';

    if (count === null && options.length > 0) {
      count = options.length;
    }

    if (count === 0) {
      key = 'No matching results';
    } else if (count > 1) {
      key = 'Show {0} suggestions';
    } else if (count === 1) {
      key = 'Show suggestion';
    }

    return formatMessage(key, [count]);
  }

  setAutocompleteRef = a => this.autocomplete = a;

  setTextFieldRef = t => this.textfield = t;

  render() {
    const {
      id = this.comboBoxId,
      className,
      value,
      disabled,
      required,
      invalid,
      quiet,
      onChange,
      onSelect,
      ...props
    } = this.props;

    return (
      <Autocomplete
        className={
          classNames(
            'spectrum-InputGroup',
            {
              'spectrum-InputGroup--quiet': quiet
            },
            className
          )
        }
        ref={this.setAutocompleteRef}
        getCompletions={this.getCompletions}
        value={value}
        onChange={chain(onChange, this.onChange)}
        onSelect={onSelect}
        onMenuShow={this.onMenuShow}
        onMenuHide={this.onMenuHide}>
        <Textfield
          className={classNames('spectrum-InputGroup-field')}
          {...props}
          id={id}
          ref={this.setTextFieldRef}
          disabled={disabled}
          required={required}
          invalid={invalid}
          autocompleteInput
          quiet={quiet} />
        <Button
          id={`${id}-button`}
          type="button"
          variant="field"
          onClick={this.onButtonClick}
          onMouseDown={e => e.preventDefault()}
          onMouseUp={e => e.preventDefault()}
          disabled={disabled}
          required={required}
          invalid={invalid}
          quiet={quiet}
          selected={this.state.open}
          aria-label={this.getButtonLabel()}
          aria-labelledby={`${id} ${id}-button`}
          tabIndex="-1">
          <ChevronDownMedium size={null} className="spectrum-InputGroup-icon" />
        </Button>
      </Autocomplete>
    );
  }
}
