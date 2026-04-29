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

import {describe, expect, it} from 'vitest';
import {GridList, GridListItem} from '../src/GridList';
import React from 'react';
import {render} from 'vitest-browser-react';
import {User} from '@react-aria/test-utils';

describe('GridList grid keyboard navigation in real browser', () => {
  it('navigates to a target row using real CSS grid layout', async () => {
    let testUtilUser = new User({interactionType: 'keyboard'});

    let {container} = await render(
      <GridList
        layout="grid"
        aria-label="Test"
        selectionMode="single"
        style={{display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gridAutoRows: '40px'}}>
        <GridListItem id="0,0">0,0</GridListItem>
        <GridListItem id="0,1">0,1</GridListItem>
        <GridListItem id="0,2">0,2</GridListItem>
        <GridListItem id="1,0">1,0</GridListItem>
        <GridListItem id="1,1">1,1</GridListItem>
        <GridListItem id="1,2">1,2</GridListItem>
        <GridListItem id="2,0">2,0</GridListItem>
        <GridListItem id="2,1">2,1</GridListItem>
        <GridListItem id="2,2">2,2</GridListItem>
      </GridList>
    );

    let gridlist = container.querySelector('[role=grid]') as HTMLElement;
    let tester = testUtilUser.createTester('GridList', {root: gridlist, interactionType: 'keyboard', layout: 'grid'});

    let rows = tester.rows();
    expect(rows).toHaveLength(9);

    await tester.toggleRowSelection({row: rows[5], checkboxSelection: false});

    expect(rows[5].getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(rows[5]);
  });
});
