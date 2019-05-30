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
  divider,
  ...otherProps
}) {
  return (
    <td
      className={
        classNames(
          'spectrum-Table-cell',
          {
            'spectrum-Table-cell--divider': divider
          },
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
  /** Whether or not to display a vertical dividing line to the right of the cell. */
  isDivider: PropTypes.bool
};
