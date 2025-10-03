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

import {screen, testSSR} from '@react-spectrum/test-utils-internal';

describe('useViewportSize SSR', () => {
  it('should render without errors', async () => {
    await testSSR(__filename, `
      import {useViewportSize} from '../src';

      function Viewport() {
        useViewportSize();
        return null;
      }

      <Viewport />
    `);
  });

  it('should update dimensions after hydration', async () => {
    await testSSR(__filename, `
      import {useViewportSize} from '../src';

      function Viewport() {
        let size = useViewportSize();
        return <div data-testid="viewport">{size.width}x{size.height}</div>;
      }

      <Viewport />
    `, () => {
      expect(screen.getByTestId('viewport')).toHaveTextContent('0x0');
    });

    expect(screen.getByTestId('viewport')).not.toHaveTextContent('0x0');
  });
});
