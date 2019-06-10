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
let QUIET_MARGIN = 24;

@autobind
export default class Select extends React.Component {
  static propTypes = {
    /**
     * If true, the select list will close on selection of an item
     */
    closeOnSelect: PropTypes.bool,

    /**
     * String for extra class names to add to the select list
     */
    menuClassName: PropTypes.string,

    /**
     * A function that returns a wrapper component to render a list item label.
     * Useful in providing custom html to the rendered label.
     */
    renderItem: PropTypes.func,

    /** Sets the selected item (controlled) for the component. */
    value: PropTypes.string,

    /** Sets the initial selected item (uncontrolled) for the component. */
    defaultValue: PropTypes.string,

    /** Whether to allow multiple item selection. */
    multiple: PropTypes.bool,

    /** Array of strings of options in list */
    options: PropTypes.arrayOf(PropTypes.object),

    /** Function to call when the selected value changes. */
    onChange: PropTypes.func,

    /** Function to call when the dropdown menu is opened. */
    onOpen: PropTypes.func,

    /** Function to call when the dropdown menu is closed. */
    onClose: PropTypes.func,

    /** Whether to render the quiet variant of the component. */
    quiet: PropTypes.bool,

    /** Whether to render the invalid appearance of the component. */
    invalid: PropTypes.bool,

    /** Whether to enforce that at least one option from the list is selected by the user. */
    required: PropTypes.bool,

    /** Whether the component width should adjust to match the width of the selected value's text. */
    flexible: PropTypes.bool,

    /** Placeholder text to display if no items have been selected. */
    placeholder: PropTypes.string,

    /** Sets whether the overlay is flippable. Shift the overlay to the opposite position if out of view. */
    flip: PropTypes.bool,

    /** Sets the positioning of the dropdown to align to the right. */
    alignRight: PropTypes.bool,

    /** Sets the icon displayed in the select bar if multiple items are selectable. */
    icon: PropTypes.node
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
      onClose,
      closeOnSelect,
      menuClassName,
      disabled = false,
      invalid = false,
      multiple = false,
      required = false,
      flexible = false,
      placeholder = 'Select an option',
      className,
      flip = true,
      alignRight,
      labelId,
      id = this.selectId,
      icon,
      renderItem,
      'aria-labelledby': ariaLabelledby,
      ...otherProps
    } = this.props;

    let {value} = this.state;

    const valueId = this.selectId + '-value';
    if (ariaLabelledby) {
      ariaLabelledby = ariaLabelledby + ' ' + valueId;
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
    let minWidth = this.state.width;
    if (quiet) {
      minWidth = this.state.width + QUIET_MARGIN;
    }
    if (quiet && flexible) {
      minWidth = null;
    }

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
        onClose={onClose}
        aria-required={required}
        aria-multiselectable={multiple}
        aria-disabled={disabled}
        aria-invalid={invalid}
        alignRight={alignRight}
        flip={flip}
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
          className={menuClassName}
          options={options}
          value={value}
          multiple={multiple}
          disabled={disabled}
          invalid={invalid}
          required={required}
          quiet={quiet}
          style={{
            minWidth: minWidth,
            maxWidth: this.state.width > POPOVER_MAX_WIDTH ? this.state.width : null,
            marginRight: quiet && alignRight ? -1 * (QUIET_MARGIN / 2) : null
          }}
          autoFocus
          renderItem={renderItem} />
      </Dropdown>
    );
  }
}

export function SelectMenu({onClose, onOpen, onSelect, className, open, placement, style, closeOnSelect, quiet, ...props}) {
  return (
    <Popover
      isDialog={false}
      placement={placement}
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      style={style}
      className={classNames(
        'spectrum-Dropdown-popover',
        {
          'spectrum-Dropdown-popover--quiet': quiet
        }
      )}
      closeOnSelect={closeOnSelect}>
      <SelectList {...props} className={className} onChange={onSelect} />
    </Popover>
  );
}
