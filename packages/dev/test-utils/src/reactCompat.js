import React from 'react';

let reactDomRenderer, unmount;

if (React.version.startsWith('16') || React.version.startsWith('17')) {
  const ReactDOM = require('react-dom');
  reactDomRenderer = (element, container) => ReactDOM.render(element, container);
  unmount = (container) => ReactDOM.unmountComponentAtNode(container);
} else { // For React 18
  const ReactDOMClient = require('react-dom/client');
  reactDomRenderer = (element, container) => {
    const root = ReactDOMClient.createRoot(container);
    root.render(element);
    return root; // Returning root for lifecycle management
  };
  unmount = (rootOrContainer) => {
    rootOrContainer.unmount();
  };
}

export {reactDomRenderer, unmount};
