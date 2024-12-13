import React from 'react';

export function inertValue(value: any) {
  if (typeof React['use'] === 'function') {
    return !!value;
  }
  // compatibility with React < 19
  return value ? 'true' : undefined;
}
