import {configureActions} from '@storybook/addon-actions';
import React from 'react';
import ReactDOM from 'react-dom';
import {VerticalCenter} from './layout';
import {withProviderSwitcher} from './custom-addons/provider';

const isReactConcurrent = !!React.createRoot;
const nodes = new Map();
if (isReactConcurrent) {
  ReactDOM.render = (app, rootNode) => {
    let root = nodes.get(rootNode);
    if (!root) {
      root = ReactDOM.createRoot(rootNode);
      nodes.set(rootNode, root);
    }
    root.render(app);
  };

  ReactDOM.unmountComponentAtNode = (component) => {
    const root = nodes.get(component);
    if (root) {
      root.unmount();
      return true;
    } else {
      console.error("ReactDOM injection: can't unmount the given component");
      return false;
    }
  }
};

// decorator order matters, the last one will be the outer most

configureActions({
  depth: 1
});

export const parameters = {
  options: {
    storySort: (a, b) => a[1].kind === b[1].kind ? 0 : a[1].id.localeCompare(b[1].id, undefined, { numeric: true }),
  },
  a11y: {},
  layout: 'fullscreen'
};

export const decorators = [
  story => (
    <VerticalCenter style={{alignItems: 'center', minHeight: '100vh', boxSizing: 'border-box', display: 'flex', justifyContent: 'center'}}>
      {story()}
    </VerticalCenter>
  ),
  withProviderSwitcher
];
