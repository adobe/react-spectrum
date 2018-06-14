import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React from 'react';

importSpectrumCSS('statuslight');

const VARIANTS = [
  'celery', 'yellow', 'fuchsia', 'indigo', 'seafoam', 'chartreuse', 'magenta', 'purple',
  'neutral', 'active', 'positive', 'notice', 'negative', 'archived'
];

// For backward compatibility
const DEPRECATED_VARIANTS = {
  archived: 'neutral'
};

export default function StatusLight({variant = VARIANTS[0], children, className, ...otherProps}) {
  if (DEPRECATED_VARIANTS[variant]) {
    console.warn(`The "${variant}" variant of StatusLight is deprecated. Please use "${DEPRECATED_VARIANTS[variant]}" instead.`);
    variant = DEPRECATED_VARIANTS[variant];
  }

  return (
    <div
      className={classNames('spectrum-StatusLight', `spectrum-StatusLight--${variant}`, className)}
      {...filterDOMProps(otherProps)}>
      {children}
    </div>
  );
}

StatusLight.displayName = 'StatusLight';

StatusLight.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(VARIANTS)
};
