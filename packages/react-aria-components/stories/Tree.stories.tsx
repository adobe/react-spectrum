/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {action} from '@storybook/addon-actions';
import {Button, Checkbox, CheckboxProps, Collection, Key, ListLayout, Menu, MenuTrigger, Popover, Text, Tree, TreeItem, TreeItemContent, TreeItemProps, TreeProps, Virtualizer} from 'react-aria-components';
import {classNames} from '@react-spectrum/utils';
import {MyMenuItem} from './utils';
import React, {ReactNode} from 'react';
import styles from '../example/index.css';
import {UNSTABLE_TreeLoadingSentinel} from '../src/Tree';
import { useAsyncList } from 'react-stately';

export default {
  title: 'React Aria Components'
};

interface StaticTreeItemProps extends TreeItemProps {
  title?: string,
  children: ReactNode
}

function MyCheckbox({children, ...props}: CheckboxProps) {
  return (
    <Checkbox {...props}>
      {({isIndeterminate}) => (
        <>
          <div className="checkbox">
            <svg viewBox="0 0 18 18" aria-hidden="true">
              {isIndeterminate
                ? <rect x={1} y={7.5} width={15} height={3} />
                : <polyline points="1 9 7 14 15 4" />}
            </svg>
          </div>
          {children}
        </>
      )}
    </Checkbox>
  );
}

const StaticTreeItem = (props: StaticTreeItemProps) => {
  return (
    <TreeItem
      {...props}
      className={({isFocused, isSelected, isHovered, isFocusVisible}) => classNames(styles, 'tree-item', {
        focused: isFocused,
        'focus-visible': isFocusVisible,
        selected: isSelected,
        hovered: isHovered
      })}>
      <TreeItemContent>
        {({isExpanded, hasChildItems, level, selectionMode, selectionBehavior}) => (
          <>
            {selectionMode !== 'none' && selectionBehavior === 'toggle' && (
              <MyCheckbox slot="selection" />
            )}
            <div
              className={classNames(styles, 'content-wrapper')}
              style={{marginInlineStart: `${(!hasChildItems ? 20 : 0) + (level - 1) * 15}px`}}>
              {hasChildItems && (
                <Button className={styles.chevron} slot="chevron">
                  <div style={{transform: `rotate(${isExpanded ? 90 : 0}deg)`, width: '16px', height: '16px'}}>
                    <svg viewBox="0 0 24 24" style={{width: '16px', height: '16px'}}>
                      <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </Button>
                )}
              <Text className={styles.title}>{props.title || props.children}</Text>
              <Button className={styles.button} aria-label="Info" onPress={action('Info press')}>ⓘ</Button>
              <MenuTrigger>
                <Button aria-label="Menu">☰</Button>
                <Popover>
                  <Menu className={styles.menu} onAction={action('menu action')}>
                    <MyMenuItem>Foo</MyMenuItem>
                    <MyMenuItem>Bar</MyMenuItem>
                    <MyMenuItem>Baz</MyMenuItem>
                  </Menu>
                </Popover>
              </MenuTrigger>
            </div>
          </>
        )}
      </TreeItemContent>
      {props.title && props.children}
    </TreeItem>
  );
};

const TreeExampleStaticRender = (args) => (
  <Tree className={styles.tree} {...args} disabledKeys={['projects']} aria-label="test static tree" onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
    <StaticTreeItem id="Photos" textValue="Photos">Photos</StaticTreeItem>
    <StaticTreeItem id="projects" textValue="Projects" title="Projects">
      <StaticTreeItem id="projects-1" textValue="Projects-1" title="Projects-1">
        <StaticTreeItem id="projects-1A" textValue="Projects-1A">
          Projects-1A
        </StaticTreeItem>
      </StaticTreeItem>
      <StaticTreeItem id="projects-2" textValue="Projects-2">
        Projects-2
      </StaticTreeItem>
      <StaticTreeItem id="projects-3" textValue="Projects-3">
        Projects-3
      </StaticTreeItem>
    </StaticTreeItem>
    <TreeItem
      id="reports"
      textValue="Reports"
      className={({isFocused, isSelected, isHovered, isFocusVisible}) => classNames(styles, 'tree-item', {
        focused: isFocused,
        'focus-visible': isFocusVisible,
        selected: isSelected,
        hovered: isHovered
      })}>
      <TreeItemContent>
        Reports
      </TreeItemContent>
    </TreeItem>
    <TreeItem
      id="Tests"
      textValue="Tests"
      className={({isFocused, isSelected, isHovered, isFocusVisible}) => classNames(styles, 'tree-item', {
        focused: isFocused,
        'focus-visible': isFocusVisible,
        selected: isSelected,
        hovered: isHovered
      })}>
      <TreeItemContent>
        {({isFocused}) => (
          <Text>{`${isFocused} Tests`}</Text>
        )}
      </TreeItemContent>
    </TreeItem>
  </Tree>
);

export const TreeExampleStatic = {
  render: TreeExampleStaticRender,
  args: {
    selectionMode: 'none',
    selectionBehavior: 'toggle',
    disabledBehavior: 'selection',
    disallowClearAll: false
  },
  argTypes: {
    selectionMode: {
      control: 'radio',
      options: ['none', 'single', 'multiple']
    },
    selectionBehavior: {
      control: 'radio',
      options: ['toggle', 'replace']
    },
    disabledBehavior: {
      control: 'radio',
      options: ['selection', 'all']
    }
  },
  parameters: {
    description: {
      data: 'Note that the last two items are just to test bare minimum TreeItem and thus dont have the checkbox or any of the other contents that the other items have. The last item tests the isFocused renderProp'
    }
  }
};

let rows = [
  {id: 'projects', name: 'Projects', childItems: [
    {id: 'project-1', name: 'Project 1'},
    {id: 'project-2', name: 'Project 2', childItems: [
      {id: 'project-2A', name: 'Project 2A'},
      {id: 'project-2B', name: 'Project 2B'},
      {id: 'project-2C', name: 'Project 2C'}
    ]},
    {id: 'project-3', name: 'Project 3'},
    {id: 'project-4', name: 'Project 4'},
    {id: 'project-5', name: 'Project 5', childItems: [
      {id: 'project-5A', name: 'Project 5A'},
      {id: 'project-5B', name: 'Project 5B'},
      {id: 'project-5C', name: 'Project 5C'}
    ]}
  ]},
  {id: 'reports', name: 'Reports', childItems: [
    {id: 'reports-1', name: 'Reports 1', childItems: [
      {id: 'reports-1A', name: 'Reports 1A', childItems: [
        {id: 'reports-1AB', name: 'Reports 1AB', childItems: [
          {id: 'reports-1ABC', name: 'Reports 1ABC'}
        ]}
      ]},
      {id: 'reports-1B', name: 'Reports 1B'},
      {id: 'reports-1C', name: 'Reports 1C'}
    ]},
    {id: 'reports-2', name: 'Reports 2'}
  ]}
];

const MyTreeLoader = (props) => {
  return (
    <UNSTABLE_TreeLoadingSentinel {...props}>
      {({level}) => {
        let message = `Level ${level} loading spinner`;
        if (level === 1) {
          message = 'Load more spinner';
        }
        return (
          <span style={{marginInlineStart: `${(level > 1 ? 25 : 0) + (level - 1) * 15}px`}}>
            {message}
          </span>
        );
      }}
    </UNSTABLE_TreeLoadingSentinel>
  );
};

interface DynamicTreeItemProps extends TreeItemProps<object> {
  children: ReactNode,
  childItems?: Iterable<object>,
  isLoading?: boolean,
  renderLoader?: (id: Key | undefined) => boolean
}

const DynamicTreeItem = (props: DynamicTreeItemProps) => {
  let {childItems, renderLoader} = props;
  return (
    <>
      <TreeItem
        {...props}
        className={({isFocused, isSelected, isHovered, isFocusVisible}) => classNames(styles, 'tree-item', {
          focused: isFocused,
          'focus-visible': isFocusVisible,
          selected: isSelected,
          hovered: isHovered
        })}>
        <TreeItemContent>
          {({isExpanded, hasChildItems, level, selectionBehavior, selectionMode}) => (
            <>
              {selectionMode !== 'none' && selectionBehavior === 'toggle' && (
                <MyCheckbox slot="selection" />
              )}
              <div className={styles['content-wrapper']} style={{marginInlineStart: `${(!hasChildItems ? 20 : 0) + (level - 1) * 15}px`}}>
                {hasChildItems && (
                <Button className={styles.chevron} slot="chevron">
                  <div style={{transform: `rotate(${isExpanded ? 90 : 0}deg)`, width: '16px', height: '16px'}}>
                    <svg viewBox="0 0 24 24" style={{width: '16px', height: '16px'}}>
                      <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </Button>
                )}
                <Text>{props.children}</Text>
                <Button className={styles.button} aria-label="Info" onPress={action('Info press')}>ⓘ</Button>
                <MenuTrigger>
                  <Button aria-label="Menu">☰</Button>
                  <Popover>
                    <Menu className={styles.menu} onAction={action('menu action')}>
                      <MyMenuItem>Foo</MyMenuItem>
                      <MyMenuItem>Bar</MyMenuItem>
                      <MyMenuItem>Baz</MyMenuItem>
                    </Menu>
                  </Popover>
                </MenuTrigger>
              </div>
            </>
          )}
        </TreeItemContent>
        <Collection items={childItems}>
          {(item: any) => (
            <DynamicTreeItem renderLoader={renderLoader} isLoading={props.isLoading} id={item.id} childItems={item.childItems} textValue={item.name} href={props.href}>
              {item.name}
            </DynamicTreeItem>
          )}
        </Collection>
      </TreeItem>
      {/* TODO how would a dynamic tree handle rendering multiple loading sentinels that each have different onLoadMores?  */}
      {renderLoader?.(props.id) && <MyTreeLoader isLoading={props.isLoading} /> }
    </>
  );
};

let defaultExpandedKeys = new Set(['projects', 'project-2', 'project-5', 'reports', 'reports-1', 'reports-1A', 'reports-1AB']);

const TreeExampleDynamicRender = (args: TreeProps<unknown>) => (
  <Tree {...args} defaultExpandedKeys={defaultExpandedKeys} disabledKeys={['reports-1AB']} className={styles.tree} aria-label="test dynamic tree" items={rows} onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
    {(item) => (
      <DynamicTreeItem id={item.id} childItems={item.childItems} textValue={item.name}>
        {item.name}
      </DynamicTreeItem>
    )}
  </Tree>
);

export const TreeExampleDynamic = {
  ...TreeExampleStatic,
  render: TreeExampleDynamicRender,
  parameters: null
};

export const WithActions = {
  ...TreeExampleDynamic,
  args: {
    onAction: action('onAction'),
    ...TreeExampleDynamic.args
  },
  name: 'Tree with actions'
};

const WithLinksRender = (args: TreeProps<unknown>) => (
  <Tree {...args} defaultExpandedKeys={defaultExpandedKeys} className={styles.tree} aria-label="test dynamic tree" items={rows} onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
    {(item) => (
      <DynamicTreeItem href="https://adobe.com/" childItems={item.childItems} textValue={item.name}>
        {item.name}
      </DynamicTreeItem>
    )}
  </Tree>
);

export const WithLinks = {
  ...TreeExampleDynamic,
  render: WithLinksRender,
  name: 'Tree with links',
  parameters: {
    description: {
      data: 'every tree item should link to adobe.com'
    }
  }
};

function renderEmptyLoader({isLoading}) {
  return isLoading ? 'Root level loading spinner' : 'Nothing in tree';
}

const EmptyTreeStatic = (args: {isLoading: boolean}) => (
  <Tree
    {...args}
    className={styles.tree}
    aria-label="test empty static tree"
    renderEmptyState={() => renderEmptyLoader({isLoading: args.isLoading})}>
    <Collection items={[]} dependencies={[args.isLoading]}>
      {(item: any) => (
        <DynamicTreeItem renderLoader={(id) => id === 'project-2C'} isLoading={args.isLoading} id={item.id} childItems={item.childItems} textValue={item.name}>
          {item.name}
        </DynamicTreeItem>
      )}
    </Collection>
  </Tree>
);

export const EmptyTreeStaticStory = {
  render: EmptyTreeStatic,
  args: {
    isLoading: false
  },
  name: 'Empty/Loading Tree rendered with TreeLoader collection element'
};

function LoadingStoryDepOnCollection(args) {
  return (
    <Tree {...args} defaultExpandedKeys={defaultExpandedKeys} disabledKeys={['reports-1AB']} className={styles.tree} aria-label="test dynamic tree" onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
      <Collection items={rows} dependencies={[args.isLoading]}>
        {(item) => (
          <DynamicTreeItem renderLoader={(id) => id === 'project-2C'} isLoading={args.isLoading} id={item.id} childItems={item.childItems} textValue={item.name}>
            {item.name}
          </DynamicTreeItem>
        )}
      </Collection>
      <MyTreeLoader isLoading={args.isLoading} />
    </Tree>
  );
}

export const LoadingStoryDepOnCollectionStory = {
  render: LoadingStoryDepOnCollection,
  args: {
    isLoading: false
  },
  name: 'Loading, static root loader and dynamic rows',
  parameters: {
    description: {
      data: 'Test that Level 3 loading spinner and the root level load spinner appear when toggling isLoading in the controls'
    }
  }
};

function LoadingStoryDepOnTop(args: TreeProps<unknown> & {isLoading: boolean}) {
  return (
    <Tree {...args} dependencies={[args.isLoading]} items={rows} defaultExpandedKeys={defaultExpandedKeys} disabledKeys={['reports-1AB']} className={styles.tree} aria-label="test dynamic tree" onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
      {(item) => (
        <DynamicTreeItem renderLoader={(id) => (id === 'reports' || id === 'project-2C')} isLoading={args.isLoading} id={item.id} childItems={item.childItems} textValue={item.name}>
          {item.name}
        </DynamicTreeItem>
      )}
    </Tree>
  );
}

export const LoadingStoryDepOnTopStory = {
  render: LoadingStoryDepOnTop,
  args: {
    isLoading: false
  },
  name: 'Loading, dynamic rows, root loader rendered dynamically as well',
  parameters: {
    description: {
      data: 'Test that Level 3 loading spinner and the root level load spinner appear when toggling isLoading in the controls'
    }
  }
};

function ExpandButton(props) {
  let {isLoading, isExpanded} = props;
  let contents;
  if (!isLoading) {
    contents = isExpanded ? '⏷' : '⏵';
  } else {
    contents = '↻';
  }

  return (
    <Button slot="chevron">
      {contents}
    </Button>
  );
}

const DynamicTreeItemWithButtonLoader = (props: DynamicTreeItemProps) => {
  let {childItems, renderLoader, isLoading} = props;

  return (
    <>
      <TreeItem
        {...props}
        className={({isFocused, isSelected, isHovered, isFocusVisible}) => classNames(styles, 'tree-item', {
          focused: isFocused,
          'focus-visible': isFocusVisible,
          selected: isSelected,
          hovered: isHovered
        })}>
        <TreeItemContent>
          {({isExpanded, hasChildItems, level, selectionBehavior, selectionMode}) => (
            <>
              {selectionMode !== 'none' && selectionBehavior === 'toggle' && (
                <MyCheckbox slot="selection" />
              )}
              <div className={styles['content-wrapper']} style={{marginInlineStart: `${(!hasChildItems ? 20 : 0) + (level - 1) * 15}px`}}>
                {hasChildItems && <ExpandButton isLoading={isLoading && renderLoader && renderLoader(props.id)} isExpanded={isExpanded} />}
                <Text>{props.children}</Text>
                <Button className={styles.button} aria-label="Info" onPress={action('Info press')}>ⓘ</Button>
                <MenuTrigger>
                  <Button aria-label="Menu">☰</Button>
                  <Popover>
                    <Menu className={styles.menu} onAction={action('menu action')}>
                      <MyMenuItem>Foo</MyMenuItem>
                      <MyMenuItem>Bar</MyMenuItem>
                      <MyMenuItem>Baz</MyMenuItem>
                    </Menu>
                  </Popover>
                </MenuTrigger>
              </div>
            </>
          )}
        </TreeItemContent>
        <Collection items={childItems}>
          {(item: any) => (
            <DynamicTreeItemWithButtonLoader renderLoader={renderLoader} isLoading={props.isLoading} id={item.id} childItems={item.childItems} textValue={item.name} href={props.href}>
              {item.name}
            </DynamicTreeItemWithButtonLoader>
          )}
        </Collection>
      </TreeItem>
      {renderLoader?.(props.id) && <UNSTABLE_TreeLoadingSentinel isLoading={isLoading} />}
    </>
  );
};

function ButtonLoadingIndicator(args: TreeProps<unknown> & {isLoading: boolean}) {
  return (
    <Tree {...args} dependencies={[args.isLoading]} items={rows} defaultExpandedKeys={defaultExpandedKeys} disabledKeys={['reports-1AB']} className={styles.tree} aria-label="test dynamic tree" onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
      {(item) => (
        <DynamicTreeItemWithButtonLoader renderLoader={(id) => (id === 'project-2' || id === 'project-5')} isLoading={args.isLoading} id={item.id} childItems={item.childItems} textValue={item.name}>
          {item.name}
        </DynamicTreeItemWithButtonLoader>
      )}
    </Tree>
  );
}

export const ButtonLoadingIndicatorStory = {
  render: ButtonLoadingIndicator,
  args: {
    isLoading: false
  },
  name: 'Loading, dynamic rows, spinner renders in button',
  parameters: {
    description: {
      data: 'Test that the expand icon for Project 2 and 5 change to spinner icons when isLoading is toggled on via controls'
    }
  }
};
function VirtualizedTreeRender(args) {
  return (
    <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: 30}}>
      <TreeExampleDynamicRender {...args} />
    </Virtualizer>
  );
}

export const VirtualizedTree = {
  ...TreeExampleDynamic,
  render: VirtualizedTreeRender
};


function AsyncTree(args) {
  // This returns the initial tree, and handles loading more items at the root level
  // let tree = useAsyncList({});

  // then we have separate useAsyncList calls for each level that might have more items to load?
  // it would need to be separate so we can have separate, individual loading states
  // each useAsyncList would then need to update the original tree. I guess that would be in a useEffect or in the load itself

  // The problem is how to pass the proper LoadingSentinel to its respective level with its unique isLoading and onLoadMore when using dynamic renderer?
  // Perhaps just a wrapper function that takes the parent id of the loader and then returns the specific isLoading/onLoadMore from a map or something?
  // However, what about the collection that we need to provide to useLoadMore? That collection would be equal to the entire collection but we need to watch for updates
  // to just the subsection that is being loaded in case there are multiple loading calls happening at the same time... Maybe we don't need the collection reference anymore
  // since useLoadMore is being called in the collection element rather than the top?

  return (
    // TODO do we still need dependencies array? dependencies={[args.isLoading]}
    <Tree {...args} items={rows} className={styles.tree} aria-label="test async dynamic tree" onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
      {(item) => (
        <DynamicTreeItem renderLoader={(id) => (id === 'reports' || id === 'project-2C')} isLoading={args.isLoading} id={item.id} childItems={item.childItems} textValue={item.name}>
          {item.name}
        </DynamicTreeItem>
      )}
    </Tree>
  );
}

// - first try top level loader and see if it even will call load properly with the loader being in a realatively hidden element
// - then try wil mocked loading (use star wars api) and see if I can refactor useLoadMore some more and get rid of some stuff
// (apply to other components if so)
// - then try multi loading

// TODO make an async Tree (dynamic, skip static because it feels unlikely that people would do async)
// the tree should have a loading sentinel at the bottom, one in an arbitrary level, and one in a collapsed section
// Each loading sentinel should have its own onLoadMore and isLoading, but they should all modify a single tree (will need the useTreeData changes in https://github.com/adobe/react-spectrum/pull/7854/files perhaps)
// First just tie a storybook action, but then add mock dating loading

// test virtualized as well
// first test if the loader is the document
