import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * A table body
 */
export default function TBody({
  className,
  children,
  ...otherProps
}) {
  return (
    <tbody
      className={
        classNames(
          'spectrum-Table-body',
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      {children}
    </tbody>
  );
}

TBody.displayName = 'TBody';
TBody.propTypes = {
  className: PropTypes.string
};
