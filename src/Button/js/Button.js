import classNames from 'classnames';
import {cloneIcon} from '../../utils/icon';
import React, {Component} from 'react';
import '../style/index.styl';

// For backward compatibility with coral
const VARIANTS = {
  'quiet': 'quiet--primary',
  'minimal': 'quiet--secondary'
};

export default class Button extends Component {
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

  render() {
    const {
      element: Element = 'button',
      label,
      children,
      variant = 'default',
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
      otherProps.tabIndex = disabled ? -1 : otherProps.tabIndex || 0;
      otherProps['aria-disabled'] = disabled;
    }

    let variantPrefix = '';
    if (logic) {
      variantPrefix = 'logic--';
    } else if (quiet) {
      variantPrefix = 'quiet--';
    }

    let iconOnly = icon && !(label || children);

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
        onClick={this.onClick}>
        {cloneIcon(icon, {size: 'S'})}
        {(label || children) &&
          <span className="spectrum-Button-label">{label}{children}</span>
        }
      </Element>
    );
  }
}
