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

export default function StatusLight({variant = VARIANTS[0], children, disabled, className, ...otherProps}) {
  if (DEPRECATED_VARIANTS[variant]) {
    console.warn(`The "${variant}" variant of StatusLight is deprecated. Please use "${DEPRECATED_VARIANTS[variant]}" instead.`);
    variant = DEPRECATED_VARIANTS[variant];
  }

  return (
    <div
      className={classNames('spectrum-StatusLight', `spectrum-StatusLight--${variant}`, {
        'is-disabled': disabled
      }, className)}
      {...filterDOMProps(otherProps)}>
      {children}
    </div>
  );
}

StatusLight.displayName = 'StatusLight';

StatusLight.propTypes = {
  /**
   * The css class for the status light, it's applied to the top level div.
   */
  className: PropTypes.string,

  /**
   * The variant changes the color of the status light.
   */
  variant: PropTypes.oneOf(VARIANTS),

  /**
   * Greys out the light and label
   */
  disabled: PropTypes.bool
};
