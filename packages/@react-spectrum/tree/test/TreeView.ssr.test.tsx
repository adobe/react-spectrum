/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {testSSR} from '@react-spectrum/test-utils-internal';

// TODO: fix the macros to work with SSR tests
describe('TreeView SSR', function () {
  it('should render without errors', async function () {
    await testSSR(__filename, `
      import {Provider} from '@react-spectrum/provider';
      import {theme} from '@react-spectrum/theme-default';
      import {TreeView, TreeViewItem, TreeViewItemContent, Text} from '../';
      <Provider theme={theme}>
        <TreeView aria-label="Example tree with static contents" defaultExpandedKeys={['documents', 'photos']} height="size-4600" maxWidth="size-6000">
          <TreeViewItem id="documents" textValue="Documents">
            <TreeViewItemContent>
              <Text>Documents</Text>
            </TreeViewItemContent>
            <TreeViewItem id="project-a" textValue="Project A">
              <TreeViewItemContent>
                <Text>Project A</Text>
              </TreeViewItemContent>
              <TreeViewItem id="weekly-report" textValue="Weekly-Report">
                <TreeViewItemContent>
                  <Text>Weekly Report</Text>
                </TreeViewItemContent>
              </TreeViewItem>
            </TreeViewItem>
            <TreeViewItem id="document-1" textValue="Document 1">
              <TreeViewItemContent>
                <Text>Document 1</Text>
              </TreeViewItemContent>
            </TreeViewItem>
            <TreeViewItem id="document-2" textValue="Document 2">
              <TreeViewItemContent>
                <Text>Document 2</Text>
              </TreeViewItemContent>
            </TreeViewItem>
          </TreeViewItem>
          <TreeViewItem id="photos" textValue="Photos">
            <TreeViewItemContent>
              <Text>Photos</Text>
            </TreeViewItemContent>
            <TreeViewItem id="image-1" textValue="Image 1">
              <TreeViewItemContent>
                <Text>Image 1</Text>
              </TreeViewItemContent>
            </TreeViewItem>
            <TreeViewItem id="image-2" textValue="Image 2">
              <TreeViewItemContent>
                <Text>Image 2</Text>
              </TreeViewItemContent>
            </TreeViewItem>
            <TreeViewItem id="image-3" textValue="Image 3">
              <TreeViewItemContent>
                <Text>Image 3</Text>
              </TreeViewItemContent>
            </TreeViewItem>
          </TreeViewItem>
        </TreeView>
      </Provider>
    `);
  });
});
