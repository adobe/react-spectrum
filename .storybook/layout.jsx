import React from 'react';

export function VerticalCenter({ children, className, style }) {
  return (
    <div
      className={ className }
      style={
        {
          position: 'absolute',
          transform: 'translate(0px, -50%)',
          top: '50%',
          left: 0,
          right: 0,
          textAlign: 'center',
          ...style
        }
      }
    >
      { children }
    </div>
  );
}

export function VerticalTop({ children, className, style }) {
  return (
    <div
      className={ className }
      style={
        {
          position: 'relative',
          top: 0,
          left: 0,
          right: 0,
          ...style
        }
      }
    >
      { children }
    </div>
  );
}
