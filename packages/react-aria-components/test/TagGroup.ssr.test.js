/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {fireEvent, screen, testSSR} from '@react-spectrum/test-utils-internal';

describe('TagGroup SSR', function () {
  it('should render without errors', async function () {
    await testSSR(__filename, `
      import {TagGroup, TagList, Tag, Label} from '../';

      function Test() {
        let [show, setShow] = React.useState(false);
        return (
          <>
            <button onClick={() => setShow(true)}>Show</button>
            <TagGroup aria-label="TagGroup">
              <Label>Test</Label>
              <TagList>
                <Tag id="1">Left</Tag>
                <Tag id="2">Middle</Tag>
                {show && <Tag id="4">Extra</Tag>}
                <Tag id="3">Right</Tag>
              </TagList>
            </TagGroup>
          </>
        );
      }

      <React.StrictMode>
        <Test />
      </React.StrictMode>
    `, () => {
      // Assert that server rendered stuff into the HTML.
      let options = screen.getAllByRole('row');
      expect(options.map(o => o.textContent)).toEqual(['Left', 'Middle', 'Right']);
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    // Assert that hydrated UI matches what we expect.
    let button = screen.getByRole('button');
    let options = screen.getAllByRole('row');
    expect(options.map(o => o.textContent)).toEqual(['Left', 'Middle', 'Right']);

    // And that it updates correctly.
    fireEvent.click(button);
    options = screen.getAllByRole('row');
    expect(options.map(o => o.textContent)).toEqual(['Left', 'Middle', 'Extra', 'Right']);
  });
});
