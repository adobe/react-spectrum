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

describe('Tree SSR', function () {
  it('should render without errors', async function () {
    await testSSR(__filename, `
      import {Button, Tree, TreeItem, TreeItemContent} from '../';

      function MyTreeItemContent(props) {
        return (
          <TreeItemContent>
          {({hasChildItems}) => (
            <>
              <Button slot="chevron" style={{visibility: hasChildItems ? 'visible' : 'hidden'}}>
                <svg viewBox="0 0 24 24">
                  <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Button>
              {props.children}
            </>
          )}
          </TreeItemContent>
        );
      }
      function Test() {
        let [show, setShow] = React.useState(false);
        return (
          <>
            <button onClick={() => setShow(true)}>Show</button>
            <Tree aria-label="Files" style={{height: '300px'}} defaultExpandedKeys={['documents', 'photos', 'project']}>
              <TreeItem id="documents" textValue="Documents">
                <MyTreeItemContent>
                  Documents
                </MyTreeItemContent>
                <TreeItem id="project" textValue="Project">
                  <MyTreeItemContent>
                    Project
                  </MyTreeItemContent>
                  {show && <TreeItem id="report" textValue="Weekly Report">
                    <MyTreeItemContent>
                      Weekly Report
                    </MyTreeItemContent>
                  </TreeItem>}
                </TreeItem>
              </TreeItem>
              <TreeItem id="photos" textValue="Photos">
                <MyTreeItemContent>
                  Photos
                </MyTreeItemContent>
                <TreeItem id="one" textValue="Image 1">
                  <MyTreeItemContent>
                    Image 1
                  </MyTreeItemContent>
                </TreeItem>
                <TreeItem id="two" textValue="Image 2">
                  <MyTreeItemContent>
                    Image 2
                  </MyTreeItemContent>
                </TreeItem>
              </TreeItem>
            </Tree>
          </>
        );
      }

      <React.StrictMode>
        <Test />
      </React.StrictMode>
    `, () => {
      // Assert that server rendered stuff into the HTML.
      let rows = screen.getAllByRole('row');
      expect(rows.map(o => o.textContent)).toEqual(['Documents', 'Project', 'Photos', 'Image 1', 'Image 2']);
    });

    // Assert that hydrated UI matches what we expect.
    let button = screen.getAllByRole('button', {name: 'Show'})[0];
    let rows = screen.getAllByRole('row');
    expect(rows.map(o => o.textContent)).toEqual(['Documents', 'Project', 'Photos', 'Image 1', 'Image 2']);

    // And that it updates correctly.
    fireEvent.click(button);
    rows = screen.getAllByRole('row');
    expect(rows.map(o => o.textContent)).toEqual(['Documents', 'Project', 'Weekly Report', 'Photos', 'Image 1', 'Image 2']);
  });
});
