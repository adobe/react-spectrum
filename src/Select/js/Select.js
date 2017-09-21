import Button from '../../Button';
import classNames from 'classnames';
import Dropdown from '../../Dropdown';
import Icon from '../../Icon';
import React from 'react';
import ReactDOM from 'react-dom';
import RootCloseWrapper from 'devongovett-react-overlays/lib/RootCloseWrapper';
import SelectList from '../../SelectList';
import '../style/index.styl';
import '../../Menu/style/index.styl';

export default class Select extends React.Component {
  constructor(props) {
    super(props);

    let value = null;
    if ('value' in props) {
      value = props.value;
    } else if ('defaultValue' in props) {
      value = props.defaultValue;
    } else if (props.multiple) {
      value = [];
    } else {
      const opt = props.options && props.options[0];
      value = opt ? opt.value : null;
    }

    this.state = {value};
  }

  componentWillReceiveProps(props) {
    if ('value' in props && props.value !== this.state.value) {
      this.setState({value: props.value});
    }
  }

  componentDidMount() {
    this.updateSize();
  }

  componentDidUpdate() {
    this.updateSize();
  }

  updateSize() {
    let width = ReactDOM.findDOMNode(this).querySelector('.spectrum-Dropdown-trigger').offsetWidth;
    if (width !== this.state.width) {
      this.setState({width});
    }
  }

  onSelect = (value) => {
    if (!('value' in this.props)) {
      this.setState({value});
    }

    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  onClose = () => {
    ReactDOM.findDOMNode(this.button).focus();
  }

  onKeyDown = (e) => {
    switch (e.key) {
      case 'Enter':
      case 'ArrowDown':
      case 'Space':
        e.preventDefault();
        this.button.onClick();
        break;
    }
  }

  render() {
    const {
      options = [],
      quiet,
      onFocus,
      onBlur,
      disabled = false,
      invalid = false,
      multiple = false,
      required = false,
      placeholder = 'Select an option',
      className
    } = this.props;

    const {value} = this.state;

    let label = placeholder;
    if (!multiple) {
      const selectedOption = options.find(o => o.value === value);
      label = selectedOption ? selectedOption.label : placeholder;
    }

    return (
      <Dropdown
        className={classNames('spectrum-Dropdown', {
          'spectrum-Dropdown--quiet': quiet,
          'is-disabled': disabled,
          'is-invalid': invalid
        }, className)}
        onSelect={this.onSelect}
        onClose={this.onClose}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-required={required}
        aria-multiselectable={multiple}
        aria-disabled={disabled}
        aria-invalid={invalid}>
        <Button
          className="spectrum-Dropdown-trigger"
          type="button"
          variant="dropdown"
          quiet={quiet}
          disabled={disabled}
          invalid={invalid}
          ref={b => this.button = b}
          onKeyDown={this.onKeyDown}>
          <span className="spectrum-Dropdown-trigger-container">
            <span className={classNames('spectrum-Dropdown-trigger-label', {'is-placeholder': label === placeholder})}>{label}</span>
            <span className="spectrum-Dropdown-icon-container">
              {invalid && <Icon size="S" icon="alert" className="spectrum-Icon" />}
              <span className="spectrum-Icon spectrum-Dropdown-open-icon" />
            </span>
          </span>
        </Button>
        {options.length > 0 &&
          <SelectMenu
            dropdownMenu
            options={options}
            value={value}
            multiple={multiple}
            disabled={disabled}
            invalid={invalid}
            required={required}
            style={{width: this.state.width}}
            className="spectrum-Flyout spectrum-Dropdown-flyout"
            autoFocus />
        }
      </Dropdown>
    );
  }
}

export function SelectMenu({onClose, onSelect, className, open, ...props}) {
  return (
    <RootCloseWrapper onRootClose={onClose}>
      <SelectList className={classNames(className, {'is-open': open})} {...props} onChange={onSelect} />
    </RootCloseWrapper>
  );
}
