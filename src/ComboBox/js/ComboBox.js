import autobind from 'autobind-decorator';
import Autocomplete from '../../Autocomplete';
import Button from '../../Button';
import classNames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';
import SelectDownChevron from '../../Icon/core/SelectDownChevron';
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

  state = {
    open: false
  };

  onButtonClick() {
    ReactDOM.findDOMNode(this.textfield).focus();
    this.autocomplete.toggleMenu();
  }

  getCompletions(text) {
    return this.props.options.filter(o => o.toLowerCase().startsWith(text.toLowerCase()));
  }

  onMenuShow() {
    this.setState({open: true});
  }

  onMenuHide() {
    this.setState({open: false});
  }

  render() {
    const {
      value,
      disabled,
      required,
      invalid,
      quiet,
      onChange,
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
        onChange={onChange}
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
          selected={this.state.open}>
          <SelectDownChevron size={null} className="spectrum-InputGroup-icon" />
        </Button>
      </Autocomplete>
    );
  }
}
