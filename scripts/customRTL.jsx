import React from 'react';
import {render} from '../../../../scripts/customRTL';

const Wrapper = ({children}) => (
  <React.StrictMode>
    {children}
  </React.StrictMode>
);

const customRender = (ui, options) =>
  render(ui, {
    wrapper: Wrapper,
    ...options
  }
);

// Re-export everything.
export * from '@testing-library/react';

// Override render method.
export {customRender as render};
