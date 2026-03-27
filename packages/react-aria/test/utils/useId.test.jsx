/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

describe('useId', function () {
  let OriginalFinalizationRegistry = global.FinalizationRegistry;

  afterEach(() => {
    global.FinalizationRegistry = OriginalFinalizationRegistry;
    jest.resetModules();
  });

  it('registers once per mounted id and uses an unregister token', function () {
    let register = jest.fn();
    let unregister = jest.fn();

    global.FinalizationRegistry = jest.fn(function () {
      this.register = register;
      this.unregister = unregister;
    });

    jest.isolateModules(() => {
      let React = require('react');
      let {createRoot} = require('react-dom/client');
      let {act} = require('react-dom/test-utils');
      let {useId} = require('../../src/utils/useId');
      let previousActEnvironment = global.IS_REACT_ACT_ENVIRONMENT;
      global.IS_REACT_ACT_ENVIRONMENT = true;

      function Test({tick}) {
        let id = useId();
        return React.createElement('div', {'data-id': id}, tick);
      }

      let container = document.createElement('div');
      document.body.appendChild(container);
      let root = createRoot(container);

      act(() => {
        root.render(React.createElement(Test, {tick: 0}));
      });

      act(() => {
        root.render(React.createElement(Test, {tick: 1}));
      });

      act(() => {
        root.render(React.createElement(Test, {tick: 2}));
      });

      expect(register).toHaveBeenCalledTimes(1);
      expect(register.mock.calls[0][1]).toEqual(expect.any(String));
      expect(register.mock.calls[0][2]).toBe(register.mock.calls[0][0]);

      act(() => {
        root.unmount();
      });

      document.body.removeChild(container);
      global.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;

      expect(unregister).toHaveBeenCalledTimes(1);
      expect(unregister).toHaveBeenCalledWith(register.mock.calls[0][2]);
    });
  });
});
