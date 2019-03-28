import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React from 'react';

importSpectrumCSS('well');

export default function Well({
  children,
  className,
  ...otherProps
}) {
  return (
    <div
      className={
        classNames(
          'spectrum-Well',
          className
        )
      }
      {...filterDOMProps(otherProps)}>
      {children}
    </div>
  );
}

Well.displayName = 'Well';

Well.propTypes = {
  /** Custom CSS class to add to the Well component */
  className: PropTypes.string
};
