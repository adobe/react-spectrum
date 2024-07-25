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

import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';
import {SSRProvider} from '../';
import {useId} from '@react-aria/utils';

function Test() {
  return <div data-testid="test" id={useId()} />;
}

describe('SSRProvider', function () {
  it('it should generate consistent unique ids', function () {
    let tree = render(
      <SSRProvider>
        <Test />
        <Test />
      </SSRProvider>
    );

    let divs = tree.getAllByTestId('test');
    if (React.useId) {
      expect(divs[0].id.startsWith('react-aria')).toBe(true);
      expect(divs[0].id).not.toBe(divs[1].id);
    } else {
      expect(divs[0].id).toBe('react-aria-1');
      expect(divs[1].id).toBe('react-aria-2');
    }
  });

  it('it should generate consistent unique ids with nested SSR providers', function () {
    let tree = render(
      <SSRProvider>
        <Test />
        <SSRProvider>
          <Test />
          <SSRProvider>
            <Test />
          </SSRProvider>
        </SSRProvider>
        <Test />
        <SSRProvider>
          <Test />
        </SSRProvider>
      </SSRProvider>
    );

    let divs = tree.getAllByTestId('test');
    if (React.useId) {
      expect(new Set(divs.map((div) => div.id)).size).toBe(5);
    } else {
      expect(divs.map((div) => div.id)).toMatchInlineSnapshot(`
        [
          "react-aria-1",
          "react-aria-2-1",
          "react-aria-2-2-1",
          "react-aria-3",
          "react-aria-4-1",
        ]
      `);
    }
  });

  it('it should generate consistent unique ids in React strict mode', function () {
    let tree = render(
      <React.StrictMode>
        <SSRProvider>
          <Test />
          <Test />
        </SSRProvider>
      </React.StrictMode>
    );

    let divs = tree.getAllByTestId('test');
    if (React.useId) {
      expect(divs[0].id).not.toBe(divs[1].id);
    } else {
      expect(divs[0].id).toBe('react-aria-1');
      expect(divs[1].id).toBe('react-aria-2');
    }
  });

  it('it should generate consistent unique ids in React strict mode with Suspense', function () {
    let tree = render(
      <React.StrictMode>
        <SSRProvider>
          <SSRProvider>
            <React.Suspense fallback={<span>Loading</span>}>
              <Test />
            </React.Suspense>
          </SSRProvider>
          <SSRProvider>
            <React.Suspense fallback={<span>Loading</span>}>
              <Test />
            </React.Suspense>
          </SSRProvider>
        </SSRProvider>
      </React.StrictMode>
    );

    let divs = tree.getAllByTestId('test');
    if (React.useId) {
      expect(divs[0].id).not.toBe(divs[1].id);
    } else {
      expect(divs[0].id).toBe('react-aria-1-1');
      expect(divs[1].id).toBe('react-aria-2-1');
    }
  });

  it('should generate a random prefix when not server rendered', function () {
    let env = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    let tree = render(<Test />);
    expect(/^react-aria\d+-/.test(tree.getByTestId('test').id)).toBe(true);
    process.env.NODE_ENV = env;
  });

  it('should not generate a random prefix in tests', function () {
    let env = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    let tree = render(<Test />);
    expect(/^react-aria-/.test(tree.getByTestId('test').id)).toBe(true);
    process.env.NODE_ENV = env;
  });
});
