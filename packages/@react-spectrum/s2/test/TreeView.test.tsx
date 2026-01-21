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
import {render} from './utils/render';
import {TreeView, TreeViewItem, TreeViewItemContent} from '../src';

describe('TreeView', () => {
  it('renders', async () => {
    const screen = await render(
      <TreeView
        aria-label="Files"
        defaultExpandedKeys={['documents']}>
        <TreeViewItem id="documents" textValue="Documents">
          <TreeViewItemContent>Documents</TreeViewItemContent>
          <TreeViewItem id="project-a" textValue="Project A">
            <TreeViewItemContent>Project A</TreeViewItemContent>
            <TreeViewItem id="report" textValue="Weekly Report">
              <TreeViewItemContent>Weekly Report</TreeViewItemContent>
            </TreeViewItem>
          </TreeViewItem>
          <TreeViewItem id="readme" textValue="README">
            <TreeViewItemContent>README</TreeViewItemContent>
          </TreeViewItem>
        </TreeViewItem>
      </TreeView>
    );
    expect(screen.getByRole('treegrid')).toBeInTheDocument();
  });
});
