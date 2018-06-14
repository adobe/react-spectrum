import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React from 'react';

importSpectrumCSS('table');

/**
 * A table
 */
export default function Table({
  quiet,
  className,
  children,
  ...otherProps
}) {
  return (
    <table
      className={
        classNames(
          'spectrum-Table',
          {
            'spectrum-Table--quiet': quiet
          },
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      {children}
    </table>
  );
}

Table.displayName = 'Table';
Table.propTypes = {
  quiet: PropTypes.bool,
  className: PropTypes.string
};
