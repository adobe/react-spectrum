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

// Can't `import` babel, have to require?
const babel = require('@babel/core');
import {evaluate} from './ssrUtils';
import http from 'http';
import React from 'react';
import ReactDOM from 'react-dom';
import {SSRProvider} from '@react-aria/ssr';
import util from 'util';

export async function testSSR(filename, source) {
  // Transform the code with babel so JSX becomes JS.
  source = babel.transformSync(source, {filename}).code;

  // Send the HTML along with the source code to the worker to be hydrated in a DOM environment.
  return new Promise((resolve, reject) => {
    let req = http.request({
      hostname: 'localhost',
      port: 18235,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          let data = JSON.parse(body);
          reject(new Error(data.errors[0]));
          return;
        }

        // Capture React errors/warning and make them fail the tests.
        let errors = [];
        console.error = console.warn = (...messages) => {
          errors.push(util.format(...messages));
        };

        // Evaluate the code to get a React element, and hydrate into the dom.
        try {
          document.body.innerHTML = `<div id="root">${body}</div>`;
          let container = document.querySelector('#root');
          let element = evaluate(source, filename);
          ReactDOM.hydrate(<SSRProvider>{element}</SSRProvider>, container);
        } catch (err) {
          errors.push(err.stack);
        }

        if (errors.length > 0) {
          reject(new Error(errors[0]));
        } else {
          resolve();
        }
      });
    });

    req.write(JSON.stringify({filename, source}));
    req.end();
  });
}
