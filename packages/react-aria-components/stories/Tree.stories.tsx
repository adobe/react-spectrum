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
import {Button, Checkbox, CheckboxProps, Collection, DroppableCollectionReorderEvent, isTextDropItem, Key, ListLayout, Menu, MenuTrigger, Popover, Text, Tree, TreeItem, TreeItemContent, TreeItemProps, TreeProps, useDragAndDrop, Virtualizer} from 'react-aria-components';
import {classNames} from '@react-spectrum/utils';
import {Meta, StoryFn, StoryObj} from '@storybook/react';
import {MyMenuItem} from './utils';
import React, {JSX, ReactNode, useCallback, useState} from 'react';
import styles from '../example/index.css';
import {TreeLoadMoreItem} from '../src/Tree';
import {useAsyncList, useListData, useTreeData} from '@react-stately/data';
import './styles.css';

export default {
  title: 'React Aria Components/Tree',
  component: Tree,
  excludeStories: ['TreeExampleStaticRender']
} as Meta<typeof Tree>;

export type TreeStory = StoryFn<typeof Tree>;

interface StaticTreeItemProps extends TreeItemProps {
  title?: string,
  children: ReactNode
}

interface MyCheckboxProps extends CheckboxProps {
  children?: ReactNode
}

function MyCheckbox({children, ...props}: MyCheckboxProps) {
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

const StaticTreeItemNoActions = (props: StaticTreeItemProps) => {
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
            </div>
          </>
        )}
      </TreeItemContent>
      {props.title && props.children}
    </TreeItem>
  );
};

export function TreeExampleStaticRender<T extends object>(props: TreeProps<T>) {
  return (
    <Tree className={styles.tree} {...props} disabledKeys={['projects']} aria-label="test static tree" onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
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
}

const TreeExampleStaticNoActionsRender = <T extends object>(args: TreeProps<T>): JSX.Element => (
  <Tree className={styles.tree} {...args} disabledKeys={['projects']} aria-label="test static tree" onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
    <StaticTreeItemNoActions id="Photos" textValue="Photos">Photos</StaticTreeItemNoActions>
    <StaticTreeItemNoActions id="projects" textValue="Projects" title="Projects">
      <StaticTreeItemNoActions id="projects-1" textValue="Projects-1" title="Projects-1">
        <StaticTreeItemNoActions id="projects-1A" textValue="Projects-1A">
          Projects-1A
        </StaticTreeItemNoActions>
      </StaticTreeItemNoActions>
      <StaticTreeItemNoActions id="projects-2" textValue="Projects-2">
        Projects-2
      </StaticTreeItemNoActions>
      <StaticTreeItemNoActions id="projects-3" textValue="Projects-3">
        Projects-3
      </StaticTreeItemNoActions>
    </StaticTreeItemNoActions>
    <StaticTreeItemNoActions
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
    </StaticTreeItemNoActions>
    <StaticTreeItemNoActions
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
    </StaticTreeItemNoActions>
  </Tree>
);

export const TreeExampleStatic: StoryObj<typeof TreeExampleStaticRender> = {
  render: (args) => <TreeExampleStaticRender {...args} />,
  args: {
    selectionMode: 'none',
    selectionBehavior: 'toggle',
    disabledBehavior: 'selection'
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

export const TreeExampleStaticNoActions: StoryObj<typeof TreeExampleStaticNoActionsRender> = {
  render: (args) => <TreeExampleStaticNoActionsRender {...args} />,
  args: {
    selectionMode: 'none',
    selectionBehavior: 'toggle',
    disabledBehavior: 'selection'
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
      data: 'Note that the last two items are just to test bare minimum TreeItem and thus dont have the checkbox or any of the other contents that the other items have. The last item tests the isFocused renderProp. This story specifically tests tab behaviour when there are no additional actions in the tree.'
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
  let {omitChildren} = props;
  return (
    <TreeLoadMoreItem
      className={classNames(styles, 'tree-loader')}
      {...props}>
      {({level}) => {
        if (omitChildren) {
          return;
        }

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
    </TreeLoadMoreItem>
  );
};

interface DynamicTreeItemProps extends TreeItemProps<object> {
  children: ReactNode,
  childItems?: Iterable<object>,
  isLoading?: boolean,
  onLoadMore?: () => void,
  renderLoader?: (id: Key | undefined) => boolean,
  supportsDragging?: boolean,
  isLastInRoot?: boolean
}

const DynamicTreeItem = (props: DynamicTreeItemProps) => {
  let {childItems, renderLoader, supportsDragging} = props;

  return (
    <>
      <TreeItem
        {...props}
        className={({isFocused, isSelected, isHovered, isFocusVisible, isDropTarget}) => classNames(styles, 'tree-item', {
          focused: isFocused,
          'focus-visible': isFocusVisible,
          selected: isSelected,
          hovered: isHovered,
          'drop-target': isDropTarget
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
                {supportsDragging && <Button slot="drag">≡</Button>}
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
            <DynamicTreeItem supportsDragging={supportsDragging} renderLoader={renderLoader} isLoading={props.isLoading} id={item.key ?? item.name} childItems={item.children} textValue={item.name ?? item.value.name} href={props.href}>
              {item.name ?? item.value.name}
            </DynamicTreeItem>
          )}
        </Collection>
        {renderLoader?.(props.id) && <MyTreeLoader isLoading={props.isLoading} onLoadMore={props.onLoadMore} /> }
      </TreeItem>
      {props.isLastInRoot && <MyTreeLoader isLoading={props.isLoading} onLoadMore={props.onLoadMore} /> }
    </>
  );
};

let defaultExpandedKeys = new Set(['projects', 'project-2', 'project-5', 'reports', 'reports-1', 'reports-1A', 'reports-1AB']);

const TreeExampleDynamicRender = <T extends object>(args: TreeProps<T>): JSX.Element => {
  let treeData = useTreeData<any>({
    initialItems: args.items as any ?? rows,
    getKey: item => item.id,
    getChildren: item => item.childItems
  });

  return (
    <Tree {...args} defaultExpandedKeys={defaultExpandedKeys} disabledKeys={['reports-1AB']} className={styles.tree} aria-label="test dynamic tree" items={treeData.items} onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
      {(item) => (
        <DynamicTreeItem id={item.key} childItems={item.children ?? []} textValue={item.value.name}>
          {item.value.name}
        </DynamicTreeItem>
      )}
    </Tree>
  );
};

export const TreeExampleDynamic: StoryObj<typeof TreeExampleDynamicRender> = {
  ...TreeExampleStatic,
  render: (args) => <TreeExampleDynamicRender {...args} />,
  parameters: undefined
};

export const WithActions: StoryObj<typeof TreeExampleDynamicRender> = {
  ...TreeExampleDynamic,
  args: {
    onAction: action('onAction'),
    ...TreeExampleDynamic.args
  },
  name: 'Tree with actions'
};

const WithLinksRender = <T extends object>(args: TreeProps<T>): JSX.Element => {
  let treeData = useTreeData<any>({
    initialItems: rows,
    getKey: item => item.id,
    getChildren: item => item.childItems
  });
  return (
    <Tree {...args} defaultExpandedKeys={defaultExpandedKeys} className={styles.tree} aria-label="test dynamic tree" items={treeData.items} onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
      {(item) => (
        <DynamicTreeItem href="https://adobe.com/" childItems={item.children ?? []} textValue={item.value.name}>
          {item.value.name}
        </DynamicTreeItem>
    )}
    </Tree>
  );
};

export const WithLinks: StoryObj<typeof WithLinksRender> = {
  ...TreeExampleDynamic,
  render: (args) => <WithLinksRender {...args} />,
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

const EmptyTreeStatic = <T extends object>(args: TreeProps<T> & {isLoading: boolean}): JSX.Element => (
  <Tree
    {...args}
    className={styles.tree}
    aria-label="test empty static tree"
    renderEmptyState={() => renderEmptyLoader({isLoading: args.isLoading})}>
    <Collection items={[]} dependencies={[args.isLoading]}>
      {(item: any) => (
        <DynamicTreeItem renderLoader={(id) => id === 'project-2'} isLoading={args.isLoading} id={item.id} childItems={item.childItems} textValue={item.name}>
          {item.name}
        </DynamicTreeItem>
      )}
    </Collection>
  </Tree>
);

export const EmptyTreeStaticStory: StoryObj<typeof EmptyTreeStatic> = {
  render: (args) => <EmptyTreeStatic {...args} />,
  args: {
    isLoading: false
  },
  name: 'Empty/Loading Tree rendered with TreeLoader collection element'
};

function LoadingStoryDepOnCollection<T extends object>(props: TreeProps<T> & {isLoading: boolean}): JSX.Element {
  let {isLoading, ...args} = props;
  let treeData = useTreeData<any>({
    initialItems: rows,
    getKey: item => item.id,
    getChildren: item => item.childItems
  });

  return (
    <Tree {...args} defaultExpandedKeys={defaultExpandedKeys} disabledKeys={['reports-1AB']} className={styles.tree} aria-label="test dynamic tree" onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
      <Collection items={treeData.items} dependencies={[isLoading]}>
        {(item) => (
          <DynamicTreeItem renderLoader={(id) => id === 'project-2'} isLoading={isLoading} id={item.key} childItems={item.children ?? []} textValue={item.value.name}>
            {item.value.name}
          </DynamicTreeItem>
        )}
      </Collection>
      <MyTreeLoader isLoading={isLoading} />
    </Tree>
  );
}

export const LoadingStoryDepOnCollectionStory: StoryObj<typeof LoadingStoryDepOnCollection> = {
  render: (args) => <LoadingStoryDepOnCollection {...args} />,
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

function LoadingStoryDepOnTop<T extends object>(args: TreeProps<T> & {isLoading: boolean}): JSX.Element {
  let treeData = useTreeData<any>({
    initialItems: rows,
    getKey: item => item.id,
    getChildren: item => item.childItems
  });

  return (
    <Tree {...args} dependencies={[args.isLoading]} items={treeData.items} defaultExpandedKeys={defaultExpandedKeys} disabledKeys={['reports-1AB']} className={styles.tree} aria-label="test dynamic tree" onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
      {(item) => (
        <DynamicTreeItem isLastInRoot={item.key === 'reports'} renderLoader={(id) => (id === 'root' || id === 'project-2')} isLoading={args.isLoading} id={item.key} childItems={item.children ?? []} textValue={item.value.name}>
          {item.value.name}
        </DynamicTreeItem>
      )}
    </Tree>
  );
}

export const LoadingStoryDepOnTopStory: StoryObj<typeof LoadingStoryDepOnTop> = {
  render: (args) => <LoadingStoryDepOnTop {...args} />,
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
            <DynamicTreeItemWithButtonLoader renderLoader={renderLoader} isLoading={props.isLoading} id={item.key} childItems={item.children} textValue={item.value.name} href={props.href}>
              {item.value.name}
            </DynamicTreeItemWithButtonLoader>
          )}
        </Collection>
      </TreeItem>
      {renderLoader?.(props.id) && <MyTreeLoader isLoading={isLoading} omitChildren /> }
    </>
  );
};

function ButtonLoadingIndicator<T extends object>(args: TreeProps<T> & {isLoading: boolean}): JSX.Element {
  let treeData = useTreeData<any>({
    initialItems: rows,
    getKey: item => item.id,
    getChildren: item => item.childItems
  });
  return (
    <Tree {...args} dependencies={[args.isLoading]} items={treeData.items} defaultExpandedKeys={defaultExpandedKeys} disabledKeys={['reports-1AB']} className={styles.tree} aria-label="test dynamic tree" onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
      {(item) => (
        <DynamicTreeItemWithButtonLoader renderLoader={(id) => (id === 'project-2' || id === 'project-5')} isLoading={args.isLoading} id={item.key} childItems={item.children ?? []} textValue={item.value.name}>
          {item.value.name}
        </DynamicTreeItemWithButtonLoader>
      )}
    </Tree>
  );
}

export const ButtonLoadingIndicatorStory: StoryObj<typeof ButtonLoadingIndicator> = {
  render: (args) => <ButtonLoadingIndicator {...args} />,
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

function VirtualizedTreeRender<T extends object>(args: TreeProps<T>): JSX.Element {
  return (
    <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: 30}}>
      <TreeExampleDynamicRender {...args} />
    </Virtualizer>
  );
}

export const VirtualizedTree: StoryObj<typeof VirtualizedTreeRender> = {
  ...TreeExampleDynamic,
  render: (args) => <VirtualizedTreeRender {...args} />
};

let projects: {id: string, value: string}[] = [];
let projectsLevel3: {id: string, value: string}[] = [];
let documents: {id: string, value: string}[] = [];
for (let i = 0; i < 10; i++) {
  projects.push({id: `projects-${i}`, value: `Projects-${i}`});
  projectsLevel3.push({id: `project-1-${i}`, value: `Projects-1-${i}`});
  documents.push({id: `document-${i}`, value: `Document-${i}`});
}
let root = [
  {id: 'photos-1', value: 'Photos 1'},
  {id: 'photos-2', value: 'Photos 2'},
  {id: 'projects', value: 'Projects'},
  {id: 'photos-3', value: 'Photos 3'},
  {id: 'photos-4', value: 'Photos 4'},
  {id: 'documents', value: 'Documents'},
  {id: 'photos-5', value: 'Photos 5'},
  {id: 'photos-6', value: 'Photos 6'}
];

function MultiLoaderTreeMockAsync(args) {
  let rootData = useListData({
    initialItems: root
  });

  let projectsData = useListData({
    initialItems: projects
  });

  let projects3Data = useListData({
    initialItems: projectsLevel3
  });

  let documentsData = useListData({
    initialItems: documents
  });

  let [isRootLoading, setRootLoading] = useState(false);
  let [isProjectsLoading, setProjectsLoading] = useState(false);
  let [isProjectsLevel3Loading, setProjects3Loading] = useState(false);
  let [isDocumentsLoading, setDocumentsLoading] = useState(false);

  let onRootLoadMore = useCallback(() => {
    if (!isRootLoading && rootData.items.length < 30) {
      action('root loading')();
      setRootLoading(true);
      setTimeout(() => {
        let dataToAppend: {id: string, value: string}[] = [];
        let rootLength = rootData.items.length - 1;
        for (let i = 0; i < 5; i++) {
          dataToAppend.push({id: `photos-${i + rootLength}`, value: `Photos-${i + rootLength}`});
        }
        rootData.append(...dataToAppend);
        setRootLoading(false);
      }, args.delay);
    }
  }, [isRootLoading, rootData, args.delay]);

  let onProjectsLoadMore = useCallback(() => {
    if (!isProjectsLoading && projectsData.items.length < 30) {
      action('projects loading')();
      setProjectsLoading(true);
      setTimeout(() => {
        let dataToAppend: {id: string, value: string}[] = [];
        let projectsLength = projectsData.items.length;
        for (let i = 0; i < 5; i++) {
          dataToAppend.push({id: `projects-${i + projectsLength}`, value: `Projects-${i + projectsLength}`});
        }
        projectsData.append(...dataToAppend);
        setProjectsLoading(false);
      }, args.delay);
    }
  }, [isProjectsLoading, projectsData, args.delay]);

  let onProjectsLevel3LoadMore = useCallback(() => {
    if (!isProjectsLevel3Loading && projects3Data.items.length < 30) {
      action('projects level 3 loading')();
      setProjects3Loading(true);
      setTimeout(() => {
        let dataToAppend: {id: string, value: string}[] = [];
        let projects3Length = projects3Data.items.length;
        for (let i = 0; i < 5; i++) {
          dataToAppend.push({id: `project-1-${i + projects3Length}`, value: `Project-1-${i + projects3Length}`});
        }
        projects3Data.append(...dataToAppend);
        setProjects3Loading(false);
      }, args.delay);
    }
  }, [isProjectsLevel3Loading, projects3Data, args.delay]);

  let onDocumentsLoadMore = useCallback(() => {
    if (!isDocumentsLoading && documentsData.items.length < 30) {
      action('documents loading')();
      setDocumentsLoading(true);
      setTimeout(() => {
        let dataToAppend: {id: string, value: string}[] = [];
        let documentsLength = documentsData.items.length;
        for (let i = 0; i < 5; i++) {
          dataToAppend.push({id: `document-${i + documentsLength}`, value: `Document-${i + documentsLength}`});
        }
        documentsData.append(...dataToAppend);
        setDocumentsLoading(false);
      }, args.delay);
    }
  }, [isDocumentsLoading, documentsData, args.delay]);

  return (
    <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: 30}}>
      <Tree
        aria-label="multi loader tree"
        className={styles.tree}>
        {/* TODO: wonder if there is something we can do to ensure that these depenedcies are provided, need to dig to make sure if there is an alternative */}
        {/* NOTE: important to provide dependencies here, otherwise the nested level doesn't perform loading updates properly */}
        <Collection items={rootData.items} dependencies={[isProjectsLoading, isDocumentsLoading, isProjectsLevel3Loading]}>
          {(item: any) => {
            if (item.id === 'projects') {
              return (
                <StaticTreeItem id="projects" textValue="Projects" title="Projects">
                  <Collection items={projectsData.items}>
                    {(item: any) => {
                      return item.id !== 'projects-1' ?
                        (
                          <StaticTreeItem id={item.id} textValue={item.value}>
                            {item.value}
                          </StaticTreeItem>
                        ) : (
                          <StaticTreeItem id="projects-1" textValue="Projects-1" title="Projects-1">
                            <Collection items={projects3Data.items}>
                              {(item: any) => (
                                <StaticTreeItem id={item.id} textValue={item.value}>
                                  {item.value}
                                </StaticTreeItem>
                              )}
                            </Collection>
                            <MyTreeLoader isLoading={isProjectsLevel3Loading} onLoadMore={onProjectsLevel3LoadMore} />
                          </StaticTreeItem>
                        );
                    }
                  }
                  </Collection>
                  <MyTreeLoader isLoading={isProjectsLoading} onLoadMore={onProjectsLoadMore} />
                </StaticTreeItem>
              );
            } else if (item.id === 'documents') {
              return (
                <StaticTreeItem id="documents" textValue="Documents" title="Documents">
                  <Collection items={documentsData.items}>
                    {(item: any) => (
                      <StaticTreeItem id={item.id} textValue={item.value}>
                        {item.value}
                      </StaticTreeItem>
                    )}
                  </Collection>
                  <MyTreeLoader isLoading={isDocumentsLoading} onLoadMore={onDocumentsLoadMore} />
                </StaticTreeItem>
              );
            } else {
              return (
                <StaticTreeItem id={item.id} textValue={item.value}>{item.value}</StaticTreeItem>
              );
            }
          }}
        </Collection>
        <MyTreeLoader isLoading={isRootLoading} onLoadMore={onRootLoadMore} />
      </Tree>
    </Virtualizer>
  );
}

export const VirtualizedTreeMultiLoaderMockAsync = {
  render: MultiLoaderTreeMockAsync,
  args: {
    delay: 2000
  }
};

interface Character {
  name: string,
  height: number,
  mass: number,
  birth_year: number
}

function MultiLoaderTreeUseAsyncList(args) {
  let root = [
    {id: 'photos-1', name: 'Photos 1'},
    {id: 'photos-2', name: 'Photos 2'},
    {id: 'photos-3', name: 'Photos 3'},
    {id: 'photos-4', name: 'Photos 4'},
    {id: 'starwars', name: 'Star Wars'},
    {id: 'photos-5', name: 'Photos 5'},
    {id: 'photos-6', name: 'Photos 6'}
  ];

  let rootData = useListData({
    initialItems: root
  });

  let starWarsList = useAsyncList<Character>({
    async load({signal, cursor, filterText}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      action('starwars loading')();
      await new Promise(resolve => setTimeout(resolve, args.delay));
      let res = await fetch(cursor || `https://swapi.py4e.com/api/people/?search=${filterText}`, {signal});
      let json = await res.json();

      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  let [isRootLoading, setRootLoading] = useState(false);
  let onRootLoadMore = useCallback(() => {
    if (!isRootLoading) {
      action('root loading')();
      setRootLoading(true);
      setTimeout(() => {
        let dataToAppend: {id: string, name: string}[] = [];
        let rootLength = rootData.items.length;
        for (let i = 0; i < 5; i++) {
          dataToAppend.push({id: `photos-${i + rootLength}`, name: `Photos-${i + rootLength}`});
        }
        rootData.append(...dataToAppend);
        setRootLoading(false);
      }, args.delay);
    }
  }, [isRootLoading, rootData, args.delay]);

  return (
    <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: 30}}>
      <Tree
        aria-label="multi loader tree"
        className={styles.tree}>
        <Collection items={rootData.items} dependencies={[starWarsList.isLoading]}>
          {(item: any) => (
            <DynamicTreeItem
              renderLoader={(id) => id === 'starwars'}
              isLoading={item.id === 'starwars' ? starWarsList.isLoading : undefined}
              onLoadMore={item.id === 'starwars' ? starWarsList.loadMore : undefined}
              id={item.id}
              childItems={item.id === 'starwars' ? starWarsList.items : []}
              textValue={item.name}>
              {item.name}
            </DynamicTreeItem>
          )}
        </Collection>
        <MyTreeLoader isLoading={isRootLoading} onLoadMore={onRootLoadMore} />
      </Tree>
    </Virtualizer>
  );
}

export const VirtualizedTreeMultiLoaderUseAsyncList = {
  render: MultiLoaderTreeUseAsyncList,
  args: {
    delay: 2000
  }
};

// TODO: A fully dynamic render case like below seems to have problems with dupe keys for some reason
// Either way it feels more ergonomic to use Collection and place your loading sentinel after it anyways
{/* <Tree
items={rootData.items}
aria-label="multi loader tree"
className={styles.tree}
dependencies={[isRootLoading]}>
{(item) => {
  return (
    <DynamicTreeItem
      isLastInRoot={item.id === rootData.items.at(-1)!.id}
      renderLoader={(id) => id === 'starwars'}
      isLoading={item.id === 'starwars' ? starWarsList.isLoading : isRootLoading}
      onLoadMore={item.id === 'starwars' ? starWarsList.loadMore : onRootLoadMore}
      id={item.id}
      childItems={item.id === 'starwars' ? starWarsList.items : []}
      textValue={item.name}>
      {item.name}
    </DynamicTreeItem>
  );
}} */}

function TreeDragAndDropExample<T extends object>(args: TreeProps<T> & {shouldAcceptItemDrop: 'folders' | 'all', dropFunction: 'onMove' | 'onInsert' | 'onRootDrop', shouldAllowInsert: boolean}): JSX.Element {
  let treeData = useTreeData<any>({
    initialItems: rows,
    getKey: item => item.id,
    getChildren: item => item.childItems
  });

  let getItems = (keys) => [...keys].map(key => {
    let item = treeData.getItem(key)!;

    let serializeItem = (nodeItem) => ({
      ...nodeItem.value,
      childItems: nodeItem.children ? [...nodeItem.children].map(serializeItem) : []
    });

    return {
      'text/plain': item.value.name,
      'tree-item': JSON.stringify(serializeItem(item))
    };
  });

  let {dragAndDropHooks} = useDragAndDrop({
    getItems,
    getAllowedDropOperations: () => ['move'],
    renderDragPreview(items) {
      return (
        <div style={{background: 'blue', color: 'white', padding: '4px'}}>{items.length} items</div>
      );
    },
    shouldAcceptItemDrop: (target) => {
      if (args.shouldAcceptItemDrop === 'folders') {
        let item = treeData.getItem(target.key);
        return item?.value?.childItems?.length > 0;
      }
      return true;
    },
    [args.dropFunction]: (e: DroppableCollectionReorderEvent) => {
      console.log(`moving [${[...e.keys].join(',')}] ${e.target.dropPosition} ${e.target.key}`);
      try {
        if (e.target.dropPosition === 'before') {
          treeData.moveBefore(e.target.key, e.keys);
        } else if (e.target.dropPosition === 'after') {
          treeData.moveAfter(e.target.key, e.keys);
        } else if (e.target.dropPosition === 'on') {
          let targetNode = treeData.getItem(e.target.key);
          if (targetNode) {
            let targetIndex = targetNode.children ? targetNode.children.length : 0;
            let keyArray = Array.from(e.keys);
            for (let i = 0; i < keyArray.length; i++) {
              treeData.move(keyArray[i], e.target.key, targetIndex + i);
            }
          } else {
            console.error('Target node not found for drop on:', e.target.key);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  });

  return (
    <Tree dragAndDropHooks={dragAndDropHooks} {...args} className={styles.tree} aria-label="Tree with drag and drop" items={treeData.items}>
      {(item: any) => (
        <DynamicTreeItem id={item.key} childItems={item.children ?? []} textValue={item.value.name} supportsDragging>
          {item.value.name}
        </DynamicTreeItem>
      )}
    </Tree>
  );
}

function SecondTree(args) {
  let treeData = useTreeData<any>({
    initialItems: [],
    getKey: item => item.id,
    getChildren: item => item.childItems
  });

  let processIncomingItems = async (e) => {
    return await Promise.all(e.items.filter(isTextDropItem).map(async item => {
      let parsed = JSON.parse(await item.getText('tree-item'));
      let convertItem = item => ({
        ...item,
        id: Math.random().toString(36),
        childItems: item.childItems?.map(convertItem)
      });
      return convertItem(parsed);
    }));
  };

  let getItems = (keys) => [...keys].map(key => {
    let item = treeData.getItem(key)!;

    let serializeItem = (nodeItem) => ({
      ...nodeItem.value,
      childItems: nodeItem.children ? [...nodeItem.children].map(serializeItem) : []
    });

    return {
      'text/plain': item.value.name,
      'tree-item': JSON.stringify(serializeItem(item))
    };
  });

  let onInsert = async (e)  => {
    let items = await processIncomingItems(e);
    if (e.target.dropPosition === 'before') {
      treeData.insertBefore(e.target.key, ...items);
    } else if (e.target.dropPosition === 'after') {
      treeData.insertAfter(e.target.key, ...items);
    }
  };

  let {dragAndDropHooks} = useDragAndDrop({
    getItems, // Enable dragging FROM this tree
    getAllowedDropOperations: () => ['move'],
    acceptedDragTypes: ['tree-item'],
    onInsert: args.shouldAllowInsert ? onInsert : undefined,
    async onItemDrop(e) {
      let items = await processIncomingItems(e);
      treeData.insert(e.target.key, 0, ...items);
    },
    async onRootDrop(e) {
      let items = await processIncomingItems(e);
      treeData.insert(null, 0, ...items);
    },
    shouldAcceptItemDrop: (target) => {
      if (args.shouldAcceptItemDrop === 'folders') {
        let item = treeData.getItem(target.key);
        return item?.value?.childItems?.length > 0;
      }
      return true;
    },
    [args.dropFunction]: (e: DroppableCollectionReorderEvent) => {
      console.log(`moving [${[...e.keys].join(',')}] ${e.target.dropPosition} ${e.target.key} in SecondTree`);
      try {
        if (e.target.dropPosition === 'before') {
          treeData.moveBefore(e.target.key, e.keys);
        } else if (e.target.dropPosition === 'after') {
          treeData.moveAfter(e.target.key, e.keys);
        } else if (e.target.dropPosition === 'on') {
          let targetNode = treeData.getItem(e.target.key);
          if (targetNode) {
            let targetIndex = targetNode.children ? targetNode.children.length : 0;
            let keyArray = Array.from(e.keys);
            for (let i = 0; i < keyArray.length; i++) {
              treeData.move(keyArray[i], e.target.key, targetIndex + i);
            }
          } else {
            console.error('Target node not found for drop on:', e.target.key);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  });

  return (
    <Tree
      dragAndDropHooks={dragAndDropHooks}
      {...args}
      className={styles.tree}
      aria-label="Tree with drag and drop"
      items={treeData.items}
      renderEmptyState={() => 'Drop items here'}>
      {(item: any) => (
        <DynamicTreeItem id={item.key} childItems={item.children ?? []} textValue={item.value.name} supportsDragging>
          {item.value.name}
        </DynamicTreeItem>
      )}
    </Tree>
  );
}

export const TreeWithDragAndDrop: StoryObj<typeof TreeDragAndDropExample> = {
  ...TreeExampleDynamic,
  render: (args) => {
    return (
      <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>
        <TreeDragAndDropExample {...args} />
        <SecondTree {...args} />
      </div>
    );
  },
  args: {
    dropFunction: 'onMove',
    shouldAcceptItemDrop: 'all',
    shouldAllowInsert: true,
    ...TreeExampleDynamic.args
  },
  argTypes: {
    dropFunction: {
      control: 'radio',
      options: ['onMove', 'onReorder']
    },
    shouldAcceptItemDrop: {
      control: 'radio',
      options: ['all', 'folders']
    },
    ...TreeExampleDynamic.argTypes
  }
};

function TreeDragAndDropVirtualizedRender(args) {
  return (
    <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>
      <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: 30}}>
        <TreeDragAndDropExample defaultExpandedKeys={['projects', 'reports', 'project-2', 'project-5', 'report-1', 'reports-1', 'reports-1A', 'reports-1AB']} {...args} />
      </Virtualizer>
      <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: 30}}>
        <SecondTree {...args} />
      </Virtualizer>
    </div>
  );
}

export const TreeWithDragAndDropVirtualized = {
  ...TreeWithDragAndDrop,
  render: TreeDragAndDropVirtualizedRender,
  name: 'Tree with drag and drop (virtualized)'
};


interface ITreeItem {
  id: string,
  name: string,
  childItems?: Iterable<ITreeItem>
}

let totalItems = 0;
let itemKeys = new Set<any>();
/**
 * Generates a tree data structure with 10 items per level and 6 levels deep.
 * @returns Array of tree items with the specified structure.
 */
function generateTreeData(): Array<ITreeItem> {
  /**
   * Recursively generates tree items for a given level.
   * @param level - Current depth level (1-6).
   * @param parentId - Parent item ID for generating unique child IDs.
   * @returns Array of tree items for this level.
   */
  function generateLevel(level: number, parentId: string = ''): Array<ITreeItem> {
    const items: ITreeItem[] = [];
    const itemsPerLevel = 7;

    for (let i = 1; i < itemsPerLevel; i++) {
      const itemId = parentId ? `${parentId}-${i}` : `level-${level}-item-${i}`;
      const itemName = `Level ${level} Item ${i}`;

      const item: ITreeItem = {
        id: itemId,
        name: itemName
      };

      // Add child items if not at the deepest level (level 6)
      if (level < 6) {
        item.childItems = generateLevel(level + 1, itemId);
      }

      totalItems++;
      items.push(item);
      itemKeys.add(itemId);
    }

    return items;
  }

  return generateLevel(1);
}

const treeData = generateTreeData();

function HugeVirtualizedTreeRender<T extends object>(args: TreeProps<T>): JSX.Element {
  let [expandedKeys, setExpandedKeys] = useState(new Set<Key>());
  let expandAll = () => {
    setExpandedKeys(itemKeys);
  };

  return (
    <>
      <button onClick={expandAll}>Expand All {totalItems}</button>
      <Virtualizer layout={ListLayout} layoutOptions={{rowHeight: 30}}>
        <TreeExampleDynamicRender {...args} expandedKeys={expandedKeys} onExpandedChange={setExpandedKeys} />
      </Virtualizer>
    </>
  );
}

export const HugeVirtualizedTree: StoryObj<typeof VirtualizedTreeRender> = {
  ...TreeExampleDynamic,
  args: {
    ...TreeExampleDynamic.args,
    items: treeData
  },
  render: (args) => <HugeVirtualizedTreeRender {...args} />
};
