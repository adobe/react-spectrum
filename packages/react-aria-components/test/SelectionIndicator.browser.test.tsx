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

import {expect, it} from 'vitest';
import {Key} from '@react-types/shared';
import {page, userEvent} from 'vitest/browser';
import React, {useState} from 'react';
import {render} from 'vitest-browser-react';
import {SelectionIndicator} from '../src/SelectionIndicator';
import {ToggleButton} from '../src/ToggleButton';
import {ToggleButtonGroup} from '../src/ToggleButtonGroup';

function CenteredToggleButtonGroup() {
  let [selectedKeys, setSelectedKeys] = useState<Set<Key>>(new Set(['one']));
  let [selected] = selectedKeys;
  return (
    <div style={{height: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
      <ToggleButtonGroup
        aria-label="Options"
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}>
        {['one', 'two'].map(id => (
          <ToggleButton key={id} id={id} style={{position: 'relative', width: 100}}>
            <SelectionIndicator
              style={{position: 'absolute', inset: 0, transition: 'translate 1s'}}
            />
            {id}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {/* Keyed content that is replaced in the same commit as the selection, shifting the centered group. */}
      <p key={selected} style={{height: 100, margin: 0}}>
        {selected}
      </p>
    </div>
  );
}

it('animates the selection indicator relative to its final layout when an ancestor moves in the same commit', async () => {
  let {container} = await render(<CenteredToggleButtonGroup />);

  let translates: string[] = [];
  let observer = new MutationObserver(records => {
    for (let record of records) {
      let translate = (record.target as HTMLElement).style.translate;
      if (translate) {
        translates.push(translate);
      }
    }
  });
  observer.observe(container, {attributes: true, attributeFilter: ['style'], subtree: true});

  await userEvent.click(page.getByRole('radio', {name: 'two'}));
  await new Promise(resolve => requestAnimationFrame(resolve));
  observer.disconnect();

  expect(translates).toHaveLength(1);
  let [x, y = '0px'] = translates[0].split(' ');
  // Moving from "one" to "two" in the same row: the indicator starts one button to the left, at the same height.
  expect(parseFloat(x)).toBeLessThan(0);
  expect(parseFloat(y)).toBe(0);
});
