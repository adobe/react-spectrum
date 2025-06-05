
import App from './Panel/App';
// eslint-disable-next-line rulesdir/imports
import {createRoot} from 'react-dom/client';
// eslint-disable-next-line rulesdir/imports
import React, {StrictMode} from 'react';
console.log('main!!!');

let root = createRoot(document.getElementById('root')!);
root.render(<StrictMode><App /></StrictMode>);
