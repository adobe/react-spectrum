import autobind from 'autobind-decorator';
import Autocomplete from '../../Autocomplete';
import Button from '../../Button';
import {chain} from '../../utils/events';
import classNames from 'classnames';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import React from 'react';
import SelectDownChevron from '../../Icon/core/SelectDownChevron';
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

  onButtonClick() {
    this.textfield.focus();
    this.autocomplete.toggleMenu();
  }

  getCompletions(text) {
    if (this.shouldFilter(text)) {
      return this.props.options.filter(o => getLabel(o).toLowerCase().startsWith(text.toLowerCase()));
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

  render() {
    const {
      id,
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
        ref={a => this.autocomplete = a}
        getCompletions={this.getCompletions}
        value={value}
        onChange={chain(onChange, this.onChange)}
        onSelect={onSelect}
        onMenuShow={this.onMenuShow}
        onMenuHide={this.onMenuHide}>
        <Textfield
          className={classNames('spectrum-InputGroup-input')}
          {...props}
          id={id}
          ref={t => this.textfield = t}
          disabled={disabled}
          required={required}
          invalid={invalid}
          autocompleteInput
          quiet={quiet} />
        <Button
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
          tabIndex="-1">
          <SelectDownChevron size={null} className="spectrum-InputGroup-icon" />
        </Button>
      </Autocomplete>
    );
  }
}
