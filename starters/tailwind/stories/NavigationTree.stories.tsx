import {Button} from '../src/Button';
import {type Meta} from '@storybook/react';
import {MoreHorizontal} from 'lucide-react';
import {
  NavigationTree,
  NavigationTreeItem,
  NavigationTreeItemContent,
  NavigationTreeItemLink,
  NavigationTreeSection,
  NavigationTreeHeader
} from '../src/NavigationTree';
import React, {type ReactNode, useState} from 'react';
import {RouterProvider} from 'react-aria-components';

const meta: Meta<typeof NavigationTree> = {
  component: NavigationTree,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

function RoutedNavigationTree(props: {
  children: ({selectedRoute}: {selectedRoute: string}) => ReactNode;
  defaultSelectedRoute: string;
}) {
  let [selectedRoute, setSelectedRoute] = useState(props.defaultSelectedRoute);
  return (
    <RouterProvider navigate={setSelectedRoute}>{props.children({selectedRoute})}</RouterProvider>
  );
}

export const Example = (args: any) => (
  <RoutedNavigationTree defaultSelectedRoute="/photos">
    {({selectedRoute}) => (
      <NavigationTree
        aria-label="Files"
        selectedRoute={selectedRoute}
        defaultExpandedKeys={['files']}
        {...args}>
        <NavigationTreeItem id="home" href="/home" textValue="Home">
          <NavigationTreeItemContent>
            <NavigationTreeItemLink>Home</NavigationTreeItemLink>
            <Button variant="quiet" aria-label="More options">
              <MoreHorizontal size={16} aria-hidden />
            </Button>
          </NavigationTreeItemContent>
        </NavigationTreeItem>
        <NavigationTreeItem id="files" href="/files" textValue="Files">
          <NavigationTreeItemContent>
            <NavigationTreeItemLink>Files</NavigationTreeItemLink>
          </NavigationTreeItemContent>
          <NavigationTreeItem id="photos" href="/photos" textValue="Photos">
            <NavigationTreeItemContent>
              <NavigationTreeItemLink>Photos</NavigationTreeItemLink>
            </NavigationTreeItemContent>
          </NavigationTreeItem>
          <NavigationTreeItem id="videos" href="/videos" textValue="Videos">
            <NavigationTreeItemContent>
              <NavigationTreeItemLink>Videos</NavigationTreeItemLink>
            </NavigationTreeItemContent>
          </NavigationTreeItem>
        </NavigationTreeItem>
        <NavigationTreeItem id="shared" textValue="Shared">
          <NavigationTreeItemContent>
            <NavigationTreeItemLink>Shared</NavigationTreeItemLink>
          </NavigationTreeItemContent>
          <NavigationTreeItem id="food" href="/food" textValue="Food">
            <NavigationTreeItemContent>
              <NavigationTreeItemLink>Food</NavigationTreeItemLink>
            </NavigationTreeItemContent>
          </NavigationTreeItem>
          <NavigationTreeItem id="drinks" href="/drinks" textValue="Drinks">
            <NavigationTreeItemContent>
              <NavigationTreeItemLink>Drinks</NavigationTreeItemLink>
            </NavigationTreeItemContent>
          </NavigationTreeItem>
        </NavigationTreeItem>
      </NavigationTree>
    )}
  </RoutedNavigationTree>
);

export const Sections = (args: any) => (
  <RoutedNavigationTree defaultSelectedRoute="/projects/apollo">
    {({selectedRoute}) => (
      <NavigationTree aria-label="Workspace" selectedRoute={selectedRoute} {...args}>
        <NavigationTreeSection>
          <NavigationTreeHeader>Personal</NavigationTreeHeader>
          <NavigationTreeItem href="/home" textValue="Home">
            <NavigationTreeItemContent>
              <NavigationTreeItemLink>Home</NavigationTreeItemLink>
            </NavigationTreeItemContent>
          </NavigationTreeItem>
          <NavigationTreeItem href="/starred" textValue="Starred">
            <NavigationTreeItemContent>
              <NavigationTreeItemLink>Starred</NavigationTreeItemLink>
            </NavigationTreeItemContent>
          </NavigationTreeItem>
        </NavigationTreeSection>
        <NavigationTreeSection>
          <NavigationTreeHeader>Projects</NavigationTreeHeader>
          <NavigationTreeItem href="/projects/apollo" textValue="Apollo">
            <NavigationTreeItemContent>
              <NavigationTreeItemLink>Apollo</NavigationTreeItemLink>
            </NavigationTreeItemContent>
          </NavigationTreeItem>
          <NavigationTreeItem href="/projects/gemini" textValue="Gemini">
            <NavigationTreeItemContent>
              <NavigationTreeItemLink>Gemini</NavigationTreeItemLink>
            </NavigationTreeItemContent>
          </NavigationTreeItem>
        </NavigationTreeSection>
      </NavigationTree>
    )}
  </RoutedNavigationTree>
);
