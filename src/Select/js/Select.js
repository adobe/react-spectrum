import Button from '../../Button';
import classNames from 'classnames';
import Dropdown from '../../Dropdown';
import Icon from '../../Icon';
import React from 'react';
import ReactDOM from 'react-dom';
import RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper';
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
      variant,
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
        className={classNames('coral3-Select', {
          'coral3-Select--quiet': variant === 'quiet',
          'is-disabled': disabled,
          'is-invalid': invalid
        }, className)}
        onSelect={this.onSelect}
        onClose={this.onClose}
        aria-required={required}
        aria-multiselectable={multiple}
        aria-disabled={disabled}
        aria-invalid={invalid}>
          <Button
            type="button"
            ref={b => this.button = b}
            onKeyDown={this.onKeyDown}
            disabled={disabled}>
            <span className="coral3-Select-label">{label}</span>
            <Icon icon="chevronDown" size="XS" className="coral3-Select-openIcon" />
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
              className="coral-Menu coral3-Select-selectList"
              autoFocus />
          }
      </Dropdown>
    );
  }
}

export function SelectMenu({onClose, onSelect, ...props}) {
  return (
    <RootCloseWrapper onRootClose={onClose}>
      <SelectList {...props} onChange={onSelect} />
    </RootCloseWrapper>
  );
}
