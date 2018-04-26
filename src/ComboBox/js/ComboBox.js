import autobind from 'autobind-decorator';
import Autocomplete from '../../Autocomplete';
import Button from '../../Button';
import {chain} from '../../utils/events';
import classNames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';
import SelectDownChevron from '../../Icon/core/SelectDownChevron';
import Textfield from '../../Textfield';

importSpectrumCSS('inputgroup');

const getLabel = o => (typeof o === 'string' ? o : o.label);

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
    open: false
  };

  onButtonClick() {
    ReactDOM.findDOMNode(this.textfield).focus();
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

  onChange() {
    this.changeSinceOpen = true;
  }

  render() {
    const {
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
        className={classNames('spectrum-InputGroup', {
          'spectrum-InputGroup--quiet': quiet
        })}
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
          ref={t => this.textfield = t}
          disabled={disabled}
          required={required}
          invalid={invalid}
          autocompleteInput
          quiet={quiet} />
        <Button
          className="spectrum-InputGroup-button"
          type="button"
          variant="dropdown"
          onClick={this.onButtonClick}
          onMouseDown={e => e.preventDefault()}
          disabled={disabled}
          required={required}
          invalid={invalid}
          quiet={quiet}
          selected={this.state.open}
          tabIndex="-1">
          <SelectDownChevron size={null} className="spectrum-InputGroup-icon" />
        </Button>
      </Autocomplete>
    );
  }
}
