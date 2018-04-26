import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React from 'react';

importSpectrumCSS('statuslight');

const variants = [
  'celery', 'yellow', 'fuchsia', 'indigo', 'seafoam', 'chartreuse', 'magenta', 'purple',
  'negative', 'notice', 'positive', 'active', 'archived'
];

export default function StatusLight({variant = variants[0], children, ...otherProps}) {
  return (
    <div
      className={`spectrum-StatusLight spectrum-StatusLight--${variant}`}
      {...filterDOMProps(otherProps)}>
      {children}
    </div>
  );
}

StatusLight.displayName = 'StatusLight';

StatusLight.propTypes = {
  variant: PropTypes.oneOf(variants)
};
