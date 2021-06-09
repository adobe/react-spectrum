import clsx from 'clsx';
import React from 'react';
import {useViewportSize} from '@react-aria/utils';

export function VerticalCenter({children, className, style}) {
  let size = useViewportSize();
  return (
    <div
      className={ clsx('react-spectrum-story', className) }
      style={{...style, minHeight: size.height}}
    >
      <span style={{position: 'absolute', top: 0, left: 0}}>{REACT_VERSION}</span>
      { children }
    </div>
  );
}
