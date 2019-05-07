import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React from 'react';

importSpectrumCSS('label');

const variants = [
  'grey', 'green', 'blue', 'red', 'orange', 'and', 'or', 'active', 'inactive'
];

export default function Label({size, children, className, variant = variants[0], ...otherProps}) {
  const sizeClassPart = {L: 'large'}[size];

  return (
    <span
      className={
        classNames(
          'spectrum-Label',
          `spectrum-Label--${variant}`,
          {[`spectrum-Label--${sizeClassPart}`]: !!sizeClassPart},
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      {children}
    </span>
  );
}

Label.displayName = 'Label';

Label.propTypes = {
  /**
   * Size of the label
   */
  size: PropTypes.string,

  /**
   * Variant of the label to display
   */
  variant: PropTypes.oneOf(variants)
};
