import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
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
    console.warn('The "subtle" prop of Link is deprecated. Please use variant="quiet" instead.');
    variant = 'quiet';
  }

  if (variant === 'subtle') {
    console.warn('The "subtle" variant of Link is deprecated. Please use variant="quiet" instead.');
    variant = 'quiet';
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

Link.propTypes = {
  /** Class to add to the Link */
  className: PropTypes.string,

  /** Link variant */
  variant: PropTypes.oneOf(['quiet', 'subtle', 'overBackground'])
};

Link.displayName = 'Link';
