import clsx from 'clsx';
import React from 'react';

export function VerticalCenter({children, className, style}) {
  return (
    <div
      className={ clsx('react-spectrum-story', className) }
      style={style}
    >
      { children }
    </div>
  );
}
