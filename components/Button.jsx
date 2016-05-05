import React from 'react';
import classNames from 'classnames';
import Icon from './Icon';

export default ({
  element,
  label,
  children,
  variant,
  icon,
  iconSize,
  size,
  selected,
  square,
  block,
  className,
  ...rest
}) => {
  const Element = element || 'button';
  const sizes = {
    L: 'large',
    M: 'medium'
  };

  return (
    <Element
      className={
        classNames(
          'coral-Button',
          `coral-Button--${ variant || 'default' }`,
          `coral-Button--${ sizes[ size || 'M' ] }`,
          {
            'is-selected': selected,
            'coral-Button--block': block,
            'coral-Button--square': square
          },
          className
        )
      }
      { ...rest }
    >
      {
        icon && <Icon size={ iconSize || 'S' } icon={ icon } />
      }
      <span className="coral-Button-label">{ label }{ children }</span>
    </Element>
  );
}
