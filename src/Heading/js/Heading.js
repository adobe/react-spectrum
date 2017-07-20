import classNames from 'classnames';
import React from 'react';
import '../style/index.styl';

export default function Heading({
  size = 1,
  children,
  className,
  ...otherProps
}) {
  const Element = `h${size}`;

  return (
    <Element
      className={
        classNames(
          'coral-Heading',
          `coral-Heading--${size}`,
          className
        )
      }
      {...otherProps}
    >
      {children}
    </Element>
  );
}

Heading.displayName = 'Heading';
