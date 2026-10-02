import {enableShadowDOM} from 'react-stately/private/flags/flags';
import React from 'react';

// Read the URL param at module load so the one-way global flag is enabled before
// any story (or react-aria code) reads it. Toggling is handled by a page reload in
// the manager, so on each load we start from a clean state and re-enable if needed.
let params = new URLSearchParams(document.location.search);
if (params.get('shadowDOM') === 'true') {
  enableShadowDOM();
}

export const withShadowDOMSwitcher = Story => {
  return <Story />;
};
