// test-utils.js
import {renderHook as _renderHook} from '@testing-library/react-hooks';
import React from 'react';

export * from '@testing-library/react-hooks';

export function renderHook(ui, options) {
  return _renderHook(ui, {wrapper: React.StrictMode, ...options});
}

