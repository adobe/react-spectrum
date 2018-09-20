import AlertIcon from '../../Icon/Alert';
import autobind from 'autobind-decorator';
import Button from '../../Button';
import ChevronDownMedium from '../../Icon/core/ChevronDownMedium';
import classNames from 'classnames';
import createId from '../../utils/createId';
import Dropdown from '../../Dropdown';
import filterDOMProps from '../../utils/filterDOMProps';
import Popover from '../../Popover';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import SelectList from '../../SelectList';

importSpectrumCSS('dropdown');
require('../style/index.styl');

let POPOVER_MAX_WIDTH = null;

@autobind
export default class Select extends React.Component {
  static propTypes = {
    closeOnSelect: PropTypes.bool
  };

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
    this.selectId = createId();
  }

  componentWillReceiveProps(props) {
    if ('value' in props && props.value !== this.state.value) {
      this.setState({value: props.value});
    }
  }

  componentDidMount() {
    if (POPOVER_MAX_WIDTH == null) {
      // Render a fake popover we can measure the styles of, place it inside ourselves
      // so it gets styles dictated by the current scale
      let dummyPopover = document.createElement('div');
      dummyPopover.className = 'spectrum-Dropdown-popover';
      document.body.appendChild(dummyPopover);
      POPOVER_MAX_WIDTH = parseInt(window.getComputedStyle(dummyPopover).maxWidth, 10);
      document.body.removeChild(dummyPopover);
    }

    window.addEventListener('resize', this.updateSize);
    this.updateSize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateSize);
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

  onSelect(value) {
    if (!('value' in this.props)) {
      this.setState({value});
    }

    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  onClose() {
    ReactDOM.findDOMNode(this.button).focus();
    if (typeof this.props.onClose === 'function') {
      this.props.onClose();
    }
  }

  onOpen(e) {
    this.updateSize();
    if (typeof this.props.onOpen === 'function') {
      this.props.onOpen(e);
    }
  }

  onKeyDown(e) {
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
    let {
      options = [],
      quiet,
      closeOnSelect,
      disabled = false,
      invalid = false,
      multiple = false,
      required = false,
      flexible = false,
      placeholder = 'Select an option',
      className,
      alignRight,
      labelId,
      id = this.selectId,
      icon,
      ...otherProps
    } = this.props;

    let {value} = this.state;

    let ariaLabelledby = '';
    const valueId = this.selectId + '-value';
    if (otherProps['aria-labelledby']) {
      ariaLabelledby = otherProps['aria-labelledby'] + ' ' + valueId;
      delete otherProps['aria-labelledby'];
    } else if (otherProps['aria-label']) {
      ariaLabelledby = id + ' ' + valueId;
    } else if (labelId) {
      ariaLabelledby = labelId + ' ' + valueId;
    } else {
      ariaLabelledby = valueId;
    }

    let label = placeholder;
    if (!multiple) {
      const selectedOption = options.find(o => o.value === value);
      label = selectedOption ? selectedOption.label : placeholder;
      icon = selectedOption && selectedOption.icon;
    }

    closeOnSelect = typeof closeOnSelect === 'boolean' ? closeOnSelect : !multiple;

    // Pass ARIA props to the button, and others to the Dropdown.
    let domProps = Object.entries(filterDOMProps(otherProps));
    let buttonProps = domProps.filter(x => /^aria-.*$/.test(x[0])).reduce((o, i) => (o[i[0]] = i[1], o), {});
    let dropdownProps = domProps.filter(x => !/^aria-.*$/.test(x[0])).reduce((o, i) => (o[i[0]] = i[1], o), {});

    return (
      <Dropdown
        className={classNames(
          'spectrum-Dropdown',
          {
            'spectrum-Dropdown--quiet': quiet,
            'react-spectrum-Dropdown-fixed': quiet && !flexible,
            'react-spectrum-Dropdown-flexible': flexible,
            'is-disabled': disabled,
            'is-invalid': invalid
          },
          className
        )}
        closeOnSelect={closeOnSelect}
        onSelect={this.onSelect}
        onOpen={this.onOpen}
        onClose={this.onClose}
        alignRight={alignRight}
        {...dropdownProps}>
        <Button
          className="spectrum-Dropdown-trigger"
          type="button"
          variant="field"
          aria-haspopup="listbox"
          quiet={quiet}
          disabled={disabled}
          invalid={invalid}
          ref={b => (this.button = b)}
          onKeyDown={this.onKeyDown}
          aria-labelledby={ariaLabelledby}
          id={id}
          icon={icon}
          {...buttonProps}>
          <span
            id={valueId}
            className={classNames('spectrum-Dropdown-label', {'is-placeholder': label === placeholder})}>
            {label}
          </span>
          {invalid && <AlertIcon size="S" />}
          <ChevronDownMedium size={null} className="spectrum-Dropdown-icon" />
        </Button>
        <SelectMenu
          dropdownMenu
          options={options}
          value={value}
          multiple={multiple}
          disabled={disabled}
          invalid={invalid}
          required={required}
          style={{
            minWidth: quiet && flexible ? null : this.state.width,
            maxWidth: this.state.width > POPOVER_MAX_WIDTH ? this.state.width : null
          }}
          autoFocus />
      </Dropdown>
    );
  }
}

export function SelectMenu({onClose, onOpen, onSelect, className, open, placement, style, closeOnSelect, ...props}) {
  return (
    <Popover
      isDialog={false}
      placement={placement}
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      style={style}
      className="spectrum-Dropdown-popover"
      closeOnSelect={closeOnSelect}>
      <SelectList className={className} {...props} onChange={onSelect} onTab={e => e.preventDefault()} />
    </Popover>
  );
}
