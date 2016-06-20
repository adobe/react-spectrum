import React from 'react';
import classNames from 'classnames';

export default function Heading({
  size = 1,
  children,
  className,
  ...otherProps
}) {
  const Element = `h${ size }`;

  return (
    <Element
      className={
        classNames(
          'coral-Heading',
          `coral-Heading--${ size }`,
          className
        )
      }
      { ...otherProps }
    >
      { children }
    </Element>
  );
}
