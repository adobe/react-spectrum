import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import React from 'react';

importSpectrumCSS('avatar');

export default function Avatar({src, alt, disabled, className, ...otherProps}) {
  className = classNames('spectrum-Avatar', {
    'is-disabled': disabled
  }, className);

  return (
    <img
      {...filterDOMProps(otherProps)}
      src={src}
      alt={alt}
      className={className} />
  );
}
