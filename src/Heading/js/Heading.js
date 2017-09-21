import classNames from 'classnames';
import React from 'react';

const VARIANTS = {
  1: 'display',
  2: 'page-title',
  3: 'subtitle1',
  4: 'subtitle2',
  5: 'subtitle3',
  6: 'subtitle3'
};

const ELEMENTS = {
  'display': 'h1',
  'page-title': 'h2',
  'subtitle1': 'h2',
  'subtitle2': 'h3',
  'subtitle3': 'h4'
};

export default function Heading({
  variant,
  size = 1, // back-compat
  children,
  className,
  ...otherProps
}) {
  variant = variant || VARIANTS[size] || 'display';
  const Element = ELEMENTS[variant];

  return (
    <Element
      className={
        classNames(
          'spectrum-Heading',
          `spectrum-Heading--${variant}`,
          className
        )
      }
      {...otherProps}>
      {children}
    </Element>
  );
}

Heading.displayName = 'Heading';
