import React, { Component } from 'react';
import classNames from 'classnames';
import Icon from '../../Icon';
import '../style/index.styl';

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
      icon,
      iconSize = 'S',
      size = 'M',
      selected,
      square,
      block,
      className,
      disabled,
      ...otherProps
    } = this.props;

    const sizes = {
      L: 'large',
      M: 'medium'
    };

    if (Element !== 'button') {
      otherProps.role = 'button';
      otherProps.tabIndex = disabled ? -1 : otherProps.tabIndex || 0;
      otherProps['aria-disabled'] = disabled;
    }

    return (
      <Element
        { ...otherProps }
        className={
          classNames(
            'coral-Button',
            `coral-Button--${ variant }`,
            `coral-Button--${ sizes[size] }`,
            {
              'is-selected': selected,
              'is-disabled': disabled,
              'coral-Button--block': block,
              'coral-Button--square': square
            },
            className
          )
        }
        disabled={ disabled }
        onClick={ this.onClick }
      >
        {
          icon && <Icon size={ iconSize } icon={ icon } />
        }
        <span className="coral-Button-label">{ label }{ children }</span>
      </Element>
    );
  }
}

Button.displayName = 'Button';
