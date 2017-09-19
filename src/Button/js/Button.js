import classNames from 'classnames';
import Icon from '../../Icon';
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
      quiet,
      icon,
      iconSize = 'S',
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

    let quietClass = (quiet ? 'quiet--' : '');
    let iconOnly = icon && !(label || children);

    return (
      <Element
        {...otherProps}
        className={
          classNames(
            'spectrum-Button',
            `spectrum-Button--${quietClass + (VARIANTS[variant] || variant)}`,
            {
              'is-selected': selected,
              'is-disabled': disabled,
              'is-invalid': invalid,
              'spectrum-Button--block': block,
              ['spectrum-Button--action--' + quietClass + 'icon-only']: iconOnly
            },
            className
          )
        }
        disabled={disabled}
        onClick={this.onClick}
      >
        {icon &&
          <Icon className="spectrum-Icon" size={iconSize} icon={icon} />
        }
        {label}{children}
      </Element>
    );
  }
}
