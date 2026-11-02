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

import {fireEvent, screen, testSSR} from '@react-spectrum/test-utils-internal';

describe('Collection SSR', function () {
  it.each([
    ['useEffect', ['one', 'two'], []],
    ['useEffect', ['one', 'two'], ['three']],
    ['useEffect', [], ['one', 'two']],
    ['useEffect', [], []],
    ['useLayoutEffect', ['one', 'two'], []],
    ['useLayoutEffect', ['one', 'two'], ['three']],
    ['useLayoutEffect', [], ['one', 'two']],
    ['useLayoutEffect', [], []]
  ])(
    'should reflect collection changes from the first %s (%j to %j)',
    async function (effect, initialItems, items) {
      await testSSR(
        __filename,
        `
      import {Breadcrumb, Collection, CollectionBuilder} from '../exports/index.ts';
      import {useEffect} from 'react';
      import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';

      function Test() {
        let [items, setItems] = React.useState(${JSON.stringify(initialItems)});
        ${effect}(() => setItems(${JSON.stringify(items)}), []);

        return (
          <>
            <button onClick={() => setItems(['two', 'one'])}>Restore</button>
            <button onClick={() => setItems([])}>Clear</button>
            <CollectionBuilder content={
              <Collection>
                {items.map(id => <Breadcrumb key={id} id={id}>{id}</Breadcrumb>)}
              </Collection>
            }>
              {collection => (
                <output>
                  {JSON.stringify({
                    frozen: collection.frozen,
                    size: collection.size,
                    keys: [...collection.getKeys()].sort(),
                    visible: [...collection].map(node => node.key)
                  })}
                </output>
              )}
            </CollectionBuilder>
          </>
        );
      }

      <React.StrictMode>
        <Test />
      </React.StrictMode>
    `,
        () => {
          expect(JSON.parse(screen.getByRole('status').textContent)).toEqual({
            frozen: false,
            size: initialItems.length,
            keys: initialItems,
            visible: initialItems
          });
        }
      );

      expect(JSON.parse(screen.getByRole('status').textContent)).toEqual({
        frozen: true,
        size: items.length,
        keys: items,
        visible: items
      });

      fireEvent.click(screen.getByRole('button', {name: 'Restore'}));
      expect(JSON.parse(screen.getByRole('status').textContent)).toEqual({
        frozen: true,
        size: 2,
        keys: ['one', 'two'],
        visible: ['two', 'one']
      });

      fireEvent.click(screen.getByRole('button', {name: 'Clear'}));
      expect(JSON.parse(screen.getByRole('status').textContent)).toEqual({
        frozen: true,
        size: 0,
        keys: [],
        visible: []
      });
    }
  );
});
