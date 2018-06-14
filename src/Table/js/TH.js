import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * A table column header
 */
export default function TH({
  className,
  children,
  ...otherProps
}) {
  return (
    <th
      className={
        classNames(
          'spectrum-Table-headCell',
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      {children}
    </th>
  );
}

TH.displayName = 'TH';
TH.propTypes = {
  className: PropTypes.string
};
