import classNames from 'classnames';
import React from 'react';

export function VerticalCenter({children, className, style}) {
  return (
    <div
      className={ classNames('react-spectrum-story', className) }
      style={style}
    >
      { children }
    </div>
  );
}
