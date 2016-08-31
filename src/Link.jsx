import React from 'react';
import classNames from 'classnames';

export default function Link({
  subtle,
  children,
  className,
  ...otherProps
}) {
  return (
    <a
      className={
        classNames(
          'coral-Link',
          { 'coral-Link--subtle': subtle },
          className
        )
      }
      { ...otherProps }
    >
      { children }
    </a>
  );
}
