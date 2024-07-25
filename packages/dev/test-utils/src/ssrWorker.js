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

const http = require('http');
const identityObjectProxy = require('identity-obj-proxy');
const ignoreStyles = require('ignore-styles');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const util = require('util');

ignoreStyles.default(undefined, (module) => {
  module.exports = identityObjectProxy;
});

require('@babel/register')({
  extensions: ['.js', '.ts', '.tsx']
});

let {evaluate} = require('./ssrUtils');
let {SSRProvider} = require('@react-aria/ssr');

http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', () => {
    let parsed = JSON.parse(body);

    // Capture React errors/warning and make them fail the tests.
    let errors = [];
    console.error = console.warn = (...messages) => {
      errors.push(util.format(...messages));
    };

    let html;
    try {
      // Evaluate the code, and render the resulting JSX element to HTML.
      let element = evaluate(parsed.source, parsed.filename);
      html = ReactDOMServer.renderToString(React.createElement(SSRProvider, undefined, element));
    } catch (err) {
      errors.push(err.stack);
    }

    if (errors.length > 0) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({errors}));
    } else {
      res.setHeader('Content-Type', 'text/html');
      res.end(html);
    }
  });
}).listen(18235);
