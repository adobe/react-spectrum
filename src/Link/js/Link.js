import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import React from 'react';

importSpectrumCSS('link');

export default function Link({
  subtle, // deprecated, use variant instead
  variant,
  children,
  className,
  ...otherProps
}) {
  if (subtle) {
    console.warn('The "subtle" prop of Link is deprecated. Please use variant="subtle" instead.');
    variant = 'subtle';
  }

  return (
    <a
      className={
        classNames(
          'spectrum-Link',
          {[`spectrum-Link--${variant}`]: variant},
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      {children}
    </a>
  );
}

Link.displayName = 'Link';
