import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * A table row
 */
export default function TR({
  className,
  children,
  ...otherProps
}) {
  return (
    <tr
      className={
        classNames(
          'spectrum-Table-row',
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      {children}
    </tr>
  );
}

TR.displayName = 'TR';
TR.propTypes = {
  className: PropTypes.string
};
