import React from 'react';
import classNames from 'classnames';
import Icon from './Icon';

export default ({
  element = 'button',
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
  ...otherProps
}) => {
  const Element = element;
  const sizes = {
    L: 'large',
    M: 'medium'
  };

  return (
    <Element
      className={
        classNames(
          'coral-Button',
          `coral-Button--${variant}`,
          `coral-Button--${sizes[size]}`,
          {
            'is-selected': selected,
            'coral-Button--block': block,
            'coral-Button--square': square
          },
          className
        )
      }
      { ...otherProps }
    >
      {
        icon && <Icon size={iconSize} icon={icon} />
      }
      <span className="coral-Button-label">{label}{children}</span>
    </Element>
  );
};
