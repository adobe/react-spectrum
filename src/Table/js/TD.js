import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * A table cell
 */
export default function TD({
  className,
  children,
  ...otherProps
}) {
  return (
    <td
      className={
        classNames(
          'spectrum-Table-cell',
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      {children}
    </td>
  );
}

TD.displayName = 'TD';
TD.propTypes = {
  className: PropTypes.string
};
