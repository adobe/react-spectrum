
import {AriaTreeTests} from '../../../react-aria-components/test/AriaTree.test-util';
import FileTxt from '../s2wf-icons/S2_Icon_FileText_20_N.svg';
import Folder from '../s2wf-icons/S2_Icon_Folder_20_N.svg';
import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';
import {
  Text,
  TreeView,
  TreeViewItem,
  TreeViewItemContent
} from '../src';

AriaTreeTests({
  prefix: 'spectrum2-static',
  setup: () => {
    let offsetWidth, offsetHeight;

    beforeAll(function () {
      offsetWidth = jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 1000);
      offsetHeight = jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 1000);
    });

    afterAll(function () {
      offsetWidth.mockReset();
      offsetHeight.mockReset();
    });
  },
  renderers: {
    // todo - we don't support isDisabled on TreeViewItems?
    standard: () => render(
      <TreeView aria-label="test tree">
        <TreeViewItem id="Photos" textValue="Photos">
          <TreeViewItemContent>
            <Text>Photos</Text>
            <Folder />
          </TreeViewItemContent>
        </TreeViewItem>
        <TreeViewItem id="projects" textValue="Projects">
          <TreeViewItemContent>
            <Text>Projects</Text>
            <Folder />
          </TreeViewItemContent>
          <TreeViewItem id="projects-1" textValue="Projects-1">
            <TreeViewItemContent>
              <Text>Projects-1</Text>
              <Folder />
            </TreeViewItemContent>
            <TreeViewItem id="projects-1A" textValue="Projects-1A">
              <TreeViewItemContent>
                <Text>Projects-1A</Text>
                <FileTxt />
              </TreeViewItemContent>
            </TreeViewItem>
          </TreeViewItem>
          <TreeViewItem id="projects-2" textValue="Projects-2">
            <TreeViewItemContent>
              <Text>Projects-2</Text>
              <FileTxt />
            </TreeViewItemContent>
          </TreeViewItem>
          <TreeViewItem id="projects-3" textValue="Projects-3">
            <TreeViewItemContent>
              <Text>Projects-3</Text>
              <FileTxt />
            </TreeViewItemContent>
          </TreeViewItem>
        </TreeViewItem>
        <TreeViewItem id="school" textValue="school">
          <TreeViewItemContent>
            <Text>School</Text>
            <Folder />
          </TreeViewItemContent>
          <TreeViewItem id="homework-1" textValue="homework-1">
            <TreeViewItemContent>
              <Text>Homework-1</Text>
              <Folder />
            </TreeViewItemContent>
            <TreeViewItem id="homework-1A" textValue="homework-1A">
              <TreeViewItemContent>
                <Text>Homework-1A</Text>
                <FileTxt />
              </TreeViewItemContent>
            </TreeViewItem>
          </TreeViewItem>
          <TreeViewItem id="homework-2" textValue="homework-2">
            <TreeViewItemContent>
              <Text>Homework-2</Text>
              <FileTxt />
            </TreeViewItemContent>
          </TreeViewItem>
          <TreeViewItem id="homework-3" textValue="homework-3">
            <TreeViewItemContent>
              <Text>Homework-3</Text>
              <FileTxt />
            </TreeViewItemContent>
          </TreeViewItem>
        </TreeViewItem>
      </TreeView>
    ),
    singleSelection: () => render(
      <TreeView aria-label="test tree" selectionMode="single" disabledKeys={['school']} disabledBehavior="selection">
        <TreeViewItem id="Photos" textValue="Photos">
          <TreeViewItemContent>
            <Text>Photos</Text>
            <Folder />
          </TreeViewItemContent>
        </TreeViewItem>
        <TreeViewItem id="projects" textValue="Projects">
          <TreeViewItemContent>
            <Text>Projects</Text>
            <Folder />
          </TreeViewItemContent>
          <TreeViewItem id="projects-1" textValue="Projects-1">
            <TreeViewItemContent>
              <Text>Projects-1</Text>
              <Folder />
            </TreeViewItemContent>
            <TreeViewItem id="projects-1A" textValue="Projects-1A">
              <TreeViewItemContent>
                <Text>Projects-1A</Text>
                <FileTxt />
              </TreeViewItemContent>
            </TreeViewItem>
          </TreeViewItem>
          <TreeViewItem id="projects-2" textValue="Projects-2">
            <TreeViewItemContent>
              <Text>Projects-2</Text>
              <FileTxt />
            </TreeViewItemContent>
          </TreeViewItem>
          <TreeViewItem id="projects-3" textValue="Projects-3">
            <TreeViewItemContent>
              <Text>Projects-3</Text>
              <FileTxt />
            </TreeViewItemContent>
          </TreeViewItem>
        </TreeViewItem>
        <TreeViewItem id="school" textValue="school">
          <TreeViewItemContent>
            <Text>School</Text>
            <Folder />
          </TreeViewItemContent>
          <TreeViewItem id="homework-1" textValue="homework-1">
            <TreeViewItemContent>
              <Text>Homework-1</Text>
              <Folder />
            </TreeViewItemContent>
            <TreeViewItem id="homework-1A" textValue="homework-1A">
              <TreeViewItemContent>
                <Text>Homework-1A</Text>
                <FileTxt />
              </TreeViewItemContent>
            </TreeViewItem>
          </TreeViewItem>
          <TreeViewItem id="homework-2" textValue="homework-2">
            <TreeViewItemContent>
              <Text>Homework-2</Text>
              <FileTxt />
            </TreeViewItemContent>
          </TreeViewItem>
          <TreeViewItem id="homework-3" textValue="homework-3">
            <TreeViewItemContent>
              <Text>Homework-3</Text>
              <FileTxt />
            </TreeViewItemContent>
          </TreeViewItem>
        </TreeViewItem>
      </TreeView>
    ),
    allInteractionsDisabled: () => render(
      <TreeView aria-label="test tree" selectionMode="single" disabledKeys={['school']} disabledBehavior="all">
        <TreeViewItem id="Photos" textValue="Photos">
          <TreeViewItemContent>
            <Text>Photos</Text>
            <Folder />
          </TreeViewItemContent>
        </TreeViewItem>
        <TreeViewItem id="projects" textValue="Projects">
          <TreeViewItemContent>
            <Text>Projects</Text>
            <Folder />
          </TreeViewItemContent>
          <TreeViewItem id="projects-1" textValue="Projects-1">
            <TreeViewItemContent>
              <Text>Projects-1</Text>
              <Folder />
            </TreeViewItemContent>
            <TreeViewItem id="projects-1A" textValue="Projects-1A">
              <TreeViewItemContent>
                <Text>Projects-1A</Text>
                <FileTxt />
              </TreeViewItemContent>
            </TreeViewItem>
          </TreeViewItem>
          <TreeViewItem id="projects-2" textValue="Projects-2">
            <TreeViewItemContent>
              <Text>Projects-2</Text>
              <FileTxt />
            </TreeViewItemContent>
          </TreeViewItem>
          <TreeViewItem id="projects-3" textValue="Projects-3">
            <TreeViewItemContent>
              <Text>Projects-3</Text>
              <FileTxt />
            </TreeViewItemContent>
          </TreeViewItem>
        </TreeViewItem>
        <TreeViewItem id="school" textValue="school">
          <TreeViewItemContent>
            <Text>School</Text>
            <Folder />
          </TreeViewItemContent>
          <TreeViewItem id="homework-1" textValue="homework-1">
            <TreeViewItemContent>
              <Text>Homework-1</Text>
              <Folder />
            </TreeViewItemContent>
            <TreeViewItem id="homework-1A" textValue="homework-1A">
              <TreeViewItemContent>
                <Text>Homework-1A</Text>
                <FileTxt />
              </TreeViewItemContent>
            </TreeViewItem>
          </TreeViewItem>
          <TreeViewItem id="homework-2" textValue="homework-2">
            <TreeViewItemContent>
              <Text>Homework-2</Text>
              <FileTxt />
            </TreeViewItemContent>
          </TreeViewItem>
          <TreeViewItem id="homework-3" textValue="homework-3">
            <TreeViewItemContent>
              <Text>Homework-3</Text>
              <FileTxt />
            </TreeViewItemContent>
          </TreeViewItem>
        </TreeViewItem>
      </TreeView>
    )
  }
});
