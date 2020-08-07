/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const {JSDOM} = require('jsdom');
const {parentPort} = require('worker_threads');
const util = require('util');
require('ignore-styles');
require('@babel/register')({
  extensions: ['.js', '.ts', '.tsx']
});

let {evaluate} = require('./ssrUtils');

let globalNames = new Set(Object.getOwnPropertyNames(global));

parentPort.on('message', message => {
  // Setup JSDOM environment for the rendered HTML
  let dom = new JSDOM(`<!doctype html><html><body><div id="root">${message.html}</div></body></html>`);

  // Copy JSDOM globals into the node global object so React and others can access them.
  Object.getOwnPropertyNames(dom.window).forEach(key => {
    if (!globalNames.has(key)) {
      Object.defineProperty(global, key, Object.getOwnPropertyDescriptor(dom.window, key));
    }
  });

  // Capture React errors/warning and make them fail the tests.
  let errors = [];
  console.error = console.warn = (...messages) => {
    errors.push(util.format(...messages));
  };

  // Evaluate the code to get a React element, and hydrate into the JSDOM.
  let ReactDOM = require('react-dom');
  let container = document.querySelector('#root');
  let element = evaluate(message.source, message.filename);
  ReactDOM.hydrate(element, container);

  parentPort.postMessage({errors});
});
