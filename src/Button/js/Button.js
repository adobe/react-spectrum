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

import {chain, focusAfterMouseEvent} from '../../utils/events';
import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import convertUnsafeMethod from '../../utils/convertUnsafeMethod';
import CornerTriangle from '../../Icon/core/CornerTriangle';
import filterDOMProps from '../../utils/filterDOMProps';
import focusRing from '../../utils/focusRing';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import '../style/index.styl';

importSpectrumCSS('button');

// For backward compatibility with coral
const VARIANTS = {
  quiet: {
    variant: 'primary',
    quiet: true
  },
  minimal: {
    variant: 'secondary',
    quiet: true
  },
  icon: {
    variant: 'action',
    quiet: true
  }
};

/**
 * A **button** represents an action a user can take. Buttons can be clicked or tapped to
 * perform an action or to navigate to another page. Buttons in Spectrum have several variations
 * for different uses and multiple levels of loudness for various attention-getting needs.
 */
@convertUnsafeMethod
@focusRing
export default class Button extends Component {
  static propTypes = {
    /**
     * The variant of button to display
     */
    variant: PropTypes.oneOf(['cta', 'primary', 'secondary', 'warning', 'action', 'toggle', 'and', 'or', 'icon', 'quiet', 'minimal', 'dropdown', 'clear', 'field', 'tool', 'overBackground']),

    /**
     * Whether the button should render using a quiet variant
     */
    quiet: PropTypes.bool,

    /**
     * Whether the button is a logic button variant
     */
    logic: PropTypes.bool,

    /**
     * Whether the button is disabled
     */
    disabled: PropTypes.bool,

    /**
     * Whether the button represents a selected state
     */
    selected: PropTypes.bool,

    /**
     * Whether the button represents an invalid state
     */
    invalid: PropTypes.bool,

    /**
     * An icon to render in the button.
     */
    icon: PropTypes.element,

    /**
     * The label to display in the button
     */
    label: PropTypes.string,

    /**
     * Whether the button is a block element
     */
    block: PropTypes.bool,

    /**
     * The DOM element to use to render the button
     */
    element: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    /**
     * Whether the button should be auto focused on mount
     */
    autoFocus: PropTypes.bool,

    /**
     * A click handler for the button
     */
    onClick: PropTypes.func,

    /**
     * A visual variation that puts a small triangle in the lower right
     */
    holdAffordance: PropTypes.bool
  };

  static defaultProps = {
    autoFocus: false,
    block: false,
    disabled: false,
    element: 'button',
    invalid: false,
    label: '',
    logic: false,
    quiet: false,
    selected: false,
    variant: 'secondary',
    holdAffordance: false
  };

  componentDidMount() {
    if (this.props.autoFocus) {
      // wait a frame to make sure the button in the DOM and focusable
      requestAnimationFrame(() => this.focus());
    }
  }

  /**
   * Focus the button
   */
  focus() {
    if (this.buttonRef && !this.props.disabled && this.buttonRef.focus) {
      this.buttonRef.focus();
    }
  }

  onClick = (event, ...rest) => {
    // This is needed when `element` is an anchor or something similar.
    // When `element` is a button, we won't even get here if it's disabled and clicked.
    if (this.props.disabled) {
      // If the element is an anchor with an href, we need to preventDefault() or the browser
      // will follow the link.
      event.preventDefault();
    } else if (this.props.onClick) {
      this.props.onClick(event, ...rest);
    }
  };

  onKeyDownSpace = (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.buttonRef.click();
    }
  };

  setButtonRef = b => this.buttonRef = b;

  render() {
    let {
      element: Element = 'button',
      label,
      children,
      variant = 'secondary',
      logic,
      quiet,
      icon,
      selected,
      block,
      className,
      disabled,
      invalid,
      onMouseDown,
      onMouseUp,
      autoFocus,
      holdAffordance,
      ...otherProps
    } = this.props;

    // Map variants for backwards compatibility
    if (VARIANTS[variant]) {
      let mappedVariant = VARIANTS[variant];
      let variantName = (mappedVariant.quiet ? 'quiet ' : '') + `"${mappedVariant.variant}"`;
      console.warn(`The "${variant}" variant of Button is deprecated. Please use the ${variantName} variant instead.`);
      ({variant, quiet} = mappedVariant);
    }

    let shouldRenderHoldAffordance = false;

    // Some button variants were broken out into their own components, map them appropriately
    let baseButtonClass = 'spectrum-Button';
    if (variant === 'action' || variant === 'toggle') {
      baseButtonClass = 'spectrum-ActionButton';
      shouldRenderHoldAffordance = holdAffordance;
      if (variant === 'toggle') {
        quiet = true;
      }
      variant = '';
    } else if (logic) {
      baseButtonClass = 'spectrum-LogicButton';
    } else if (variant === 'clear') {
      baseButtonClass = 'spectrum-ClearButton';
      variant = '';
    } else if (variant === 'field') {
      baseButtonClass = 'spectrum-FieldButton';
      variant = '';
    } else if (variant === 'tool') {
      baseButtonClass = 'spectrum-Tool';
      // hold affordance is really only a part of tool.
      shouldRenderHoldAffordance = holdAffordance;
      variant = '';
    }

    if (Element !== 'button') {
      otherProps.role = 'button';
      otherProps.tabIndex = disabled ? null : otherProps.tabIndex || 0;
      otherProps['aria-disabled'] = disabled || null;
      if (Element === 'a' && disabled && otherProps.href) {
        otherProps.href = null;
      }
      otherProps.onKeyDown = disabled ? null : this.onKeyDownSpace;
    }

    let labelContents = label || (typeof children === 'string' ? children : null);

    let ariaExpanded = null;
    if (otherProps['aria-expanded'] !== undefined) {
      ariaExpanded = otherProps['aria-expanded'];
    } else if (otherProps['aria-haspopup']) {
      ariaExpanded = selected || null;
    }

    const filteredProps = typeof Element === 'string' ? filterDOMProps(otherProps) : otherProps;

    return (
      <Element
        {...filteredProps}
        className={
          classNames(
            baseButtonClass,
            quiet ? `${baseButtonClass}--quiet` : '',
            variant ? `${baseButtonClass}--${variant}` : '',
            {
              'is-selected': selected,
              'is-disabled': disabled,
              'is-invalid': invalid,
              'spectrum-Button--block': block,
              'focus-ring': autoFocus
            },
            className
          )
        }
        disabled={disabled}
        aria-invalid={invalid || null}
        aria-expanded={ariaExpanded}
        onClick={this.onClick}
        onMouseDown={chain(this.onMouseDown, focusAfterMouseEvent.bind(this, onMouseDown))}
        onMouseUp={chain(this.onMouseUp, focusAfterMouseEvent.bind(this, onMouseUp))}
        ref={this.setButtonRef}>
        {cloneIcon(icon, {size: 'S'})}
        {labelContents &&
          <span className={baseButtonClass + '-label'}>{labelContents}</span>
        }
        {shouldRenderHoldAffordance &&
          <CornerTriangle role="presentation" size={null} className="spectrum-Tool-hold" />
        }
        {typeof children !== 'string' && children}
      </Element>
    );
  }
}
