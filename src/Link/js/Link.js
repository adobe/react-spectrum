import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
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
          'spectrum-Link',
          {'spectrum-Link--subtle': subtle},
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      {children}
    </a>
  );
}

Link.displayName = 'Link';
