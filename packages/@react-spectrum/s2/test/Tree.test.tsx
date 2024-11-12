
import {AriaTreeTests} from '../../../react-aria-components/test/AriaTree.test-util';
import FileTxt from '../s2wf-icons/S2_Icon_FileText_20_N.svg';
import Folder from '../s2wf-icons/S2_Icon_Folder_20_N.svg';
import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';
import {
  Text,
  TreeView,
  TreeViewItem
} from '../src';

AriaTreeTests({
  prefix: 'spectrum2-static',
  renderers: {
    standard: () => render(
      <TreeView aria-label="test tree">
        <TreeViewItem id="Photos" textValue="Photos">
          <Text>Photos</Text>
          <Folder />
        </TreeViewItem>
        <TreeViewItem id="projects" textValue="Projects">
          <Text>Projects</Text>
          <Folder />
          <TreeViewItem id="projects-1" textValue="Projects-1">
            <Text>Projects-1</Text>
            <Folder />
            <TreeViewItem id="projects-1A" textValue="Projects-1A">
              <Text>Projects-1A</Text>
              <FileTxt />
            </TreeViewItem>
          </TreeViewItem>
          <TreeViewItem id="projects-2" textValue="Projects-2">
            <Text>Projects-2</Text>
            <FileTxt />
          </TreeViewItem>
          <TreeViewItem id="projects-3" textValue="Projects-3">
            <Text>Projects-3</Text>
            <FileTxt />
          </TreeViewItem>
        </TreeViewItem>
      </TreeView>
    )
  }
});
