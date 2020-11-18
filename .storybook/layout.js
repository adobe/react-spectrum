import clsx from 'clsx';
import React from 'react';

export function VerticalCenter({children, className, style}) {
  return (
    <div
      className={ clsx('react-spectrum-story', className) }
      style={style}
    >
      <span style={{position: 'absolute', top: 0, left: 0}}>{REACT_VERSION}</span>
      { children }
    </div>
  );
}
