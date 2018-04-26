import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import filterDOMProps from '../../utils/filterDOMProps';
import {focusAfterMouseEvent} from '../../utils/events';
import focusRing from '../../utils/focusRing';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

importSpectrumCSS('button');

// For backward compatibility with coral
const VARIANTS = {
  'quiet': 'quiet--primary',
  'minimal': 'quiet--secondary'
};

@focusRing
export default class Button extends Component {
  static propTypes = {
    autoFocus: PropTypes.bool,
    block: PropTypes.bool,
    disabled: PropTypes.bool,
    element: PropTypes.string,
    icon: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element
    ]),
    invalid: PropTypes.bool,
    label: PropTypes.string,
    logic: PropTypes.bool,
    quiet: PropTypes.bool,
    selected: PropTypes.bool,
    variant: PropTypes.oneOf(['cta', 'primary', 'secondary', 'warning', 'action', 'toggle', 'and', 'or', 'icon', 'quiet', 'minimal', 'dropdown', 'clear', 'field', 'tool']),
    onClick: PropTypes.func
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
    variant: 'secondary'
  };

  componentDidMount() {
    if (this.props.autoFocus) {
      // wait a frame to make sure the button in the DOM and focusable
      requestAnimationFrame(() => this.focus());
    }
  }

  focus() {
    if (this.buttonRef && !this.props.disabled) {
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
  }

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
      ...otherProps
    } = this.props;

    // The icon variant was deprecated; quiet action button should be used instead
    if (variant === 'icon') {
      quiet = true;
      variant = 'action';
    }

    // Some button variants were broken out into their own components, map them appropriately
    let baseButtonClass = 'spectrum-Button';
    if (variant === 'action' || variant === 'toggle') {
      baseButtonClass = 'spectrum-ActionButton';
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
      variant = '';
    }

    // Map variants for backwards compatibility
    let mappedVariant = (VARIANTS[variant] || variant);
    let variantClass = '';
    if (mappedVariant) {
      variantClass = `${baseButtonClass}`;
      if (quiet) {
        variantClass += '--quiet';
      }
      variantClass += `--${mappedVariant}`;
    } else if (quiet) {
      variantClass = `${baseButtonClass}--quiet`;
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

    return (
      <Element
        {...filterDOMProps(otherProps)}
        className={
          classNames(
            baseButtonClass,
            variantClass,
            {
              'is-selected': selected,
              'is-disabled': disabled,
              'is-invalid': invalid,
              'spectrum-Button--block': block
            },
            className
          )
        }
        disabled={disabled}
        aria-invalid={invalid || null}
        aria-expanded={ariaExpanded}
        onClick={this.onClick}
        onMouseDown={focusAfterMouseEvent.bind(this, onMouseDown)}
        onMouseUp={focusAfterMouseEvent.bind(this, onMouseUp)}
        ref={b => this.buttonRef = b}>
        {cloneIcon(icon, {size: 'S'})}
        {labelContents &&
          <span className={baseButtonClass + '-label'}>{labelContents}</span>
        }
        {typeof children !== 'string' && children}
      </Element>
    );
  }
}
