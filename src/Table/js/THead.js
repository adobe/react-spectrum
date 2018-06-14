import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * A table header row
 */
export default function THead({
  className,
  children,
  ...otherProps
}) {
  return (
    <thead
      className={
        classNames(
          'spectrum-Table-head',
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      <tr>{children}</tr>
    </thead>
  );
}

THead.displayName = 'THead';
THead.propTypes = {
  className: PropTypes.string
};
