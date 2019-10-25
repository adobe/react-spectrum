/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import classNames from 'classnames';
import convertUnsafeMethod from '../../utils/convertUnsafeMethod';
import filterDOMProps from '../../utils/filterDOMProps';
import FocusManager from '../../utils/FocusManager';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

importSpectrumCSS('buttongroup');

const BUTTONGROUP_ITEM_SELECTOR = '.spectrum-ButtonGroup-item:not([disabled]):not([aria-disabled])';
const BUTTONGROUP_SELECTED_ITEM_SELECTOR = BUTTONGROUP_ITEM_SELECTOR + '[aria-checked=true].is-selected';
const ALLOWED_BUTTON_VARIANTS = {
  tool: true,
  action: true
};

@convertUnsafeMethod
export default class ButtonGroup extends Component {
  static propTypes = {
    /**
     * All buttons in ButtonGroup are disabled, greyed out and cannot be interacted with.
     */
    disabled: PropTypes.bool,

    /**
     * Will override all child buttons invalid
     */
    invalid: PropTypes.bool,

    /**
     * Whether to use roving tabIndex so that only one element within the group can receive focus with tab key at a time.
     */
    manageTabIndex: PropTypes.bool,

    /**
     * Allows multi select
     */
    multiple: PropTypes.bool,

    /**
     * Won't allow a permanent selection
     */
    readOnly: PropTypes.bool,

    /**
     * Will override all child buttons required
     */
    required: PropTypes.bool,

    /**
     * Called whenever a button is selected (non-readonly mode)
     */
    onChange: PropTypes.func,

    /**
     * Called whenever a button is clicked (readonly mode)
     */
    onClick: PropTypes.func,

    /**
     * Renders the button group as a row or a column
     */
    orientation: PropTypes.oneOf(['horizontal', 'vertical', 'both']),

    /**
     * Value to select one or more buttons in the group. Accepts an array of strings if multiple=true,
     * otherwise accepts a string
     */
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ])
  };

  static defaultProps = {
    disabled: false,
    invalid: false,
    manageTabIndex: true,
    multiple: false,
    readOnly: false,
    required: false,
    orientation: 'both'
  };

  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    };
  }

  UNSAFE_componentWillReceiveProps(props) {
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

    // Support button's onClicks
    if (button.onClick) {
      button.onClick(e);
    }

    // Allow's the ButtonGroup's onClick to be called when a button is clicked
    if (this.props.onClick) {
      this.props.onClick(button.value, e);
    }
  }

  /**
   * @private
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
   * @private
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
    const allowedVariant = ALLOWED_BUTTON_VARIANTS[button.props.variant];
    const classes = classNames('spectrum-ButtonGroup-item', button.props.className);
    return {
      className: classes,
      selected: selected,
      disabled: disabled,
      variant: allowedVariant ? button.props.variant : 'action',
      quiet: allowedVariant ? button.props.quiet : true,
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
    let {
      children = [],
      className,
      multiple,
      disabled,
      readOnly,
      invalid,
      required,
      orientation,
      manageTabIndex,
      role,
      ...otherProps
    } = this.props;

    delete otherProps.onChange;
    delete otherProps.onClick;

    if (!role) {
      if (!readOnly && !multiple) {

        // With single-selection, the wrapper element should have role=radiogroup.
        role = 'radiogroup';
      } else if (readOnly || children.length > 2) {

        // With readOnly and more than one button, the wrapper element should have role=toolbar, otherwise with less than two items or multi-selection, use role=group.
        role = readOnly && children.length > 2 ? 'toolbar' : 'group';
      }
    }

    return (
      <FocusManager
        itemSelector={BUTTONGROUP_ITEM_SELECTOR}
        selectedItemSelector={BUTTONGROUP_SELECTED_ITEM_SELECTOR}
        orientation={role === 'toolbar' ? orientation : 'both'}
        manageTabIndex={manageTabIndex}>
        <div
          aria-invalid={invalid || null}
          aria-required={required || null}
          aria-disabled={disabled || null}
          aria-orientation={orientation !== 'both' && role === 'toolbar' ? orientation : null}
          role={role}
          {...filterDOMProps(otherProps)}
          className={
            classNames(
              'spectrum-ButtonGroup',
              {
                'spectrum-ButtonGroup--vertical': orientation === 'vertical'
              },
              className
            )
          }>
          {this.renderButtons(children)}
        </div>
      </FocusManager>
    );
  }
}
