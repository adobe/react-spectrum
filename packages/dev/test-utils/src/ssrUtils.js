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

import fs from 'fs';
import Module from 'module';
import path from 'path';
import React from 'react';
import resolve from 'resolve';
import resolver from '../../../../lib/jestResolver';
import vm from 'vm';

export function evaluate(code, filename) {
  // Setup a context to use as the global object when evaluating code.
  // It will include React, along with a fake `require` function that resolves
  // relative to the filename that's passed in (the test script.)
  let ctx = {
    React,
    require(id) {
      return require(Module._resolveFilename(id, {filename}));
    },
    exports: {}
  };

  vm.createContext(ctx);
  return vm.runInContext(code, ctx);
}

Module._resolveFilename = (request, parent) => {
  if (Module.builtinModules.includes(request)) {
    return request;
  }

  if (request.startsWith('bundle-text:')) {
    return path.join(__dirname, '../../../../__mocks__/fileMock.js');
  }

  let resolved = resolver(request, {
    basedir: path.dirname(parent.filename),
    extensions: ['.js', '.json', '.ts', '.tsx'],
    defaultResolver: (request, opts) => resolve.sync(request, opts)
  });

  return fs.realpathSync(resolved);
};
