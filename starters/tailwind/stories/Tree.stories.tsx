import type { Meta } from '@storybook/react';
import { Tree, TreeItem, TreeItemContent } from '../src/Tree';
import React from 'react';

const meta: Meta<typeof Tree> = {
  component: Tree,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
<Tree aria-label="Files" style={{height: '400px', width: '300px'}} {...args}>
  <TreeItem id="documents" textValue="Documents">
    <TreeItemContent>
      Documents
    </TreeItemContent>
    <TreeItem id="project" textValue="Project">
      <TreeItemContent>
        Project
      </TreeItemContent>
      <TreeItem id="report" textValue="Weekly Report">
        <TreeItemContent>
          Weekly Report
        </TreeItemContent>
      </TreeItem>
    </TreeItem>
  </TreeItem>
  <TreeItem id="photos" textValue="Photos">
    <TreeItemContent>
      Photos
    </TreeItemContent>
    <TreeItem id="one" textValue="Image 1">
      <TreeItemContent>
        Image 1
      </TreeItemContent>
    </TreeItem>
    <TreeItem id="two" textValue="Image 2">
      <TreeItemContent>
        Image 2
      </TreeItemContent>
    </TreeItem>
  </TreeItem>
</Tree>
);

Example.args = {
  onAction: null,
  defaultExpandedKeys: ['documents', 'photos', 'project'],
  selectionMode: 'multiple',
  defaultSelectedKeys: ['project']
};

export const DisabledItems = (args: any) => <Example {...args} />;
DisabledItems.args = {
  ...Example.args,
  disabledKeys: ['photos']
};
