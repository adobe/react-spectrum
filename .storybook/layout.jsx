import React from 'react';

export function VerticalCenter({ children, style }) {
  return (
    <div
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

export function VerticalTop({ children, style }) {
  return (
    <div
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
