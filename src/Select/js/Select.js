import AlertIcon from '../../Icon/Alert';
import Button from '../../Button';
import classNames from 'classnames';
import Dropdown from '../../Dropdown';
import Popover from '../../Popover';
import React from 'react';
import ReactDOM from 'react-dom';
import SelectDownChevron from '../../Icon/core/SelectDownChevron';
import SelectList from '../../SelectList';
import '../style/index.styl';

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
    if (this.button) {
      let width = ReactDOM.findDOMNode(this.button).offsetWidth;
      if (width !== this.state.width) {
        this.setState({width});
      }
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
    if (this.props.onClose) {
      this.props.onClose();
    }
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
      onOpen,
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
        onOpen={onOpen}
        onClose={this.onClose}
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
          <span className={classNames('spectrum-Dropdown-label', {'is-placeholder': label === placeholder})}>{label}</span>
          {invalid && <AlertIcon size="S" />}
          <SelectDownChevron size={null} className="spectrum-Dropdown-icon" />
        </Button>
        <SelectMenu
          dropdownMenu
          options={options}
          value={value}
          multiple={multiple}
          disabled={disabled}
          invalid={invalid}
          required={required}
          style={{width: this.state.width}}
          autoFocus />
      </Dropdown>
    );
  }
}

export function SelectMenu({onClose, onSelect, className, open, placement, style, ...props}) {
  return (
    <Popover isDialog={false} placement={placement} open={open} onClose={onClose} style={style}>
      <SelectList className={className} {...props} onChange={onSelect} onTab={e => e.preventDefault()} />
    </Popover>
  );
}
