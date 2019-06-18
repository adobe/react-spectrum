/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import {jsdom} from 'jsdom';
import {Module} from 'module';
import path from 'path';
import 'raf/polyfill';
import configure from 'enzyme-adapter-react-helper';

const exposedProperties = [ 'window', 'navigator', 'document' ];

global.document = jsdom('<html><body></body></html>', {features: {QuerySelector: true}});
global.window = document.defaultView;
global.HTMLElement = window.HTMLElement;
global.HTMLImageElement = window.HTMLImageElement;
global.MouseEvent = window.MouseEvent;

Object.keys(document.defaultView).forEach(property => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js',
  language: 'en-US'
};

// Override require resolution so icons work without copying them into src/
var oldResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain) {
  if (/Icon\/(core\/)?([^\/\.]+)$/.test(request)) {
    request = '@react/react-spectrum-icons/dist/' + (/core/.test(request) ? 'core/' : '') + path.basename(request);
  } else if (/\.\.\/js\/Icon/.test(request)) {
    request = path.resolve(__dirname + '/../src/Icon/js/Icon.js');
  } else if (/\.\/focus-ring-polyfill/.test(request)) {
    request = '@adobe/focus-ring-polyfill';
  }

  return oldResolveFilename.call(this, request, parent, isMain);
};

configure();
