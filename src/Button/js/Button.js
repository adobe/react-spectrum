import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import focusRing from '../../utils/focusRing';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import '../style/index.styl';

// For backward compatibility with coral
const VARIANTS = {
  'quiet': 'quiet--primary',
  'minimal': 'quiet--secondary'
};

@focusRing
export default class Button extends Component {
  static propTypes = {
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
    variant: PropTypes.oneOf(['cta', 'primary', 'secondary', 'warning', 'action', 'toggle', 'and', 'or', 'icon', 'quiet', 'minimal']),
    onClick: PropTypes.func
  };

  static defaultProps = {
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
    if (event.key === ' ') {
      event.preventDefault();
      event.target.click();
    }
  }

  render() {
    const {
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
      ...otherProps
    } = this.props;

    if (Element !== 'button') {
      otherProps.role = 'button';
      otherProps.tabIndex = disabled ? null : otherProps.tabIndex || 0;
      otherProps['aria-disabled'] = disabled || null;
      if (Element === 'a' && disabled && otherProps.href) {
        otherProps.href = null;
      }
      otherProps.onKeyDown = disabled ? null : this.onKeyDownSpace;
    }

    let variantPrefix = '';
    if (logic) {
      variantPrefix = 'logic--';
    } else if (quiet) {
      variantPrefix = 'quiet--';
    }

    let iconOnly = icon && !(label || children);
    let labelContents = label || (typeof children === 'string' ? children : null);

    return (
      <Element
        {...otherProps}
        className={
          classNames(
            'spectrum-Button',
            `spectrum-Button--${variantPrefix + (VARIANTS[variant] || variant)}`,
            {
              'is-selected': selected,
              'is-disabled': disabled,
              'is-invalid': invalid,
              'spectrum-Button--block': block,
              ['spectrum-Button--action--' + variantPrefix + 'iconOnly']: variant === 'action' && iconOnly
            },
            className
          )
        }
        disabled={disabled}
        aria-invalid={invalid || null}
        onClick={this.onClick}>
        {cloneIcon(icon, {size: 'S'})}
        {labelContents &&
          <span className="spectrum-Button-label">{labelContents}</span>
        }
        {typeof children !== 'string' && children}
      </Element>
    );
  }
}
