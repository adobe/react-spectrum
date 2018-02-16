import classNames from 'classnames';
import FocusManager from '../../utils/FocusManager';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

const BUTTONGROUP_ITEM_SELECTOR = '.spectrum-ButtonGroup-item:not([disabled]):not([aria-disabled])';
const BUTTONGROUP_SELECTED_ITEM_SELECTOR = BUTTONGROUP_ITEM_SELECTOR + '[aria-checked=true].is-selected';

export default class ButtonGroup extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    invalid: PropTypes.bool,
    multiple: PropTypes.bool,
    readOnly: PropTypes.bool,
    required: PropTypes.bool,
    onChange: PropTypes.func,
    onClick: PropTypes.func
  };

  static defaultProps = {
    disabled: false,
    invalid: false,
    multiple: false,
    readOnly: false,
    required: false
  };

  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    };
  }

  componentWillReceiveProps(props) {
    if (props.value && props.value !== this.state.value) {
      this.setState({
        value: props.value
      });
    }
  }

  addSelection(button) {
    return [
      ...(this.state.value || []),
      button.value
    ];
  }

  removeSelection(button) {
    let value = this.state.value || [];
    const index = value.indexOf(button.value);
    return [
      ...value.slice(0, index),
      ...value.slice(index + 1, value.length)
    ];
  }

  handleSelect(button, e) {
    if (!this.props.readOnly && !button.readOnly) {
      let nextButtons;
      if (this.props.multiple) {
        if (this.isSelected(button)) {
          nextButtons = this.removeSelection(button);
        } else {
          nextButtons = this.addSelection(button);
        }
      } else {
        nextButtons = button.value;
      }

      // Set state if in uncontrolled mode
      if (!('value' in this.props)) {
        this.setState({value: nextButtons});
      }

      if (this.props.onChange) {
        this.props.onChange(nextButtons, e);
      }
    }

    if (this.props.onClick) {
      this.props.onClick(button.value, e);
    }
  }

  /**
   * Evaluates whether button element is selected.
   * @param   {Object}  button Button properties object
   * @returns {Boolean} true if button is selected
   */
  isSelected(button) {
    if (this.props.readOnly) {
      return null;
    }
    return this.props.multiple
      ? this.state.value && this.state.value.indexOf(button.value) >= 0
      : this.state.value === button.value;
  }

  /**
   * The role to be used by buttons within the group. If the button group is readOnly,
   * button should retain their implicit role of button. With multiple selection, buttons
   * should have role of checkbox, and with single selection buttons should have role of radio.
   * @returns {String} role of buttons within group, either null, radio or checkbox.
   */
  getChildRole() {
    if (this.props.readOnly) {
      return null;
    }
    return this.props.multiple ? 'checkbox' : 'radio';
  }

  getChildProps(button, index) {
    const invalid = this.props.invalid || button.props.invalid;
    const required = this.props.required || button.props.required;
    const disabled = this.props.disabled || button.props.disabled;
    const selected = this.isSelected(button.props);
    const role = this.getChildRole();
    const onClick = (!disabled ? this.handleSelect.bind(this, button.props) : null);
    return {
      className: classNames('spectrum-ButtonGroup-item'),
      selected: selected,
      disabled: disabled,
      variant: 'toggle',
      onClick: onClick,
      onKeyDown: button.props.onKeyDown,
      role: role,
      'aria-checked': selected,
      'aria-invalid': invalid,
      'aria-required': required
    };
  }

  renderButtons() {
    const {children} = this.props;
    return React.Children.map(children, (child, index) =>
      child ? React.cloneElement(child, this.getChildProps(child, index)) : null
    );
  }

  render() {
    const {
      children = [],
      className,
      multiple,
      disabled,
      readOnly,
      invalid,
      required,
      ...otherProps
    } = this.props;

    delete otherProps.onChange;
    delete otherProps.onClick;

    if (!readOnly && !multiple) {

      // With single-selection, the wrapper element should have role=radiogroup.
      otherProps.role = 'radiogroup';
    } else if (readOnly || children.length > 2) {

      // With readOnly and more than one button, the wrapper element should have role=toolbar, otherwise with less than two items or multi-selection, use role=group.
      otherProps.role = readOnly && children.length > 2 ? 'toolbar' : 'group';
    }

    return (
      <FocusManager itemSelector={BUTTONGROUP_ITEM_SELECTOR} selectedItemSelector={BUTTONGROUP_SELECTED_ITEM_SELECTOR} orientation="horizontal">
        <div
          aria-invalid={invalid || null}
          aria-required={required || null}
          aria-disabled={disabled || null}
          {...otherProps}
          className={classNames('spectrum-ButtonGroup', className)}>
          {this.renderButtons(children)}
        </div>
      </FocusManager>
    );
  }
}
