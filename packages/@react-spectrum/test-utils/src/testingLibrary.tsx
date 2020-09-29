// test-utils.js
import {render as _render} from '@testing-library/react';
import React from 'react';

export * from '@testing-library/react';

export function render(ui, options) {
  return _render(ui, {wrapper: React.StrictMode, ...options});
}

