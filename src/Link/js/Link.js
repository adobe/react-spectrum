import classNames from 'classnames';
import React from 'react';
import '../style/index.styl';

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
          {'coral-Link--subtle': subtle},
          className
        )
      }
      {...otherProps}>
      {children}
    </a>
  );
}

Link.displayName = 'Link';
