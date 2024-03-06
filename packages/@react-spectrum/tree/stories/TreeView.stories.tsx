/*
 * Copyright 2020 Adobe. All rights reserved.
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
import {ActionGroup, Item} from '@react-spectrum/actiongroup';
import {Button, ButtonContext, Collection, Tree, TreeItem, TreeItemContent, TreeItemContentRenderProps, TreeItemProps, TreeItemRenderProps, TreeProps, useContextProps} from 'react-aria-components';
import {Checkbox} from '@react-spectrum/checkbox';
import ChevronLeftMedium from '@spectrum-icons/ui/ChevronLeftMedium';
import ChevronRightMedium from '@spectrum-icons/ui/ChevronRightMedium';
import {classNames, SlotProvider} from '@react-spectrum/utils';
import Delete from '@spectrum-icons/workflow/Delete';
import Edit from '@spectrum-icons/workflow/Edit';
import {Flex} from '@react-spectrum/layout';
import {isAndroid} from '@react-aria/utils';
import React, {ReactNode, useRef} from 'react';
import {style} from '@react-spectrum/style-macro-s1' with {type: 'macro'};
import styles from './styles.css';
import {Text} from '@react-spectrum/text';
import {useButton} from '@react-aria/button';
import {useLocale} from '@react-aria/i18n';



// TODO: add tree package to root package exlude css see Devons PR.
// Get rid of the existing Tree in the package, we don't need it anymore

export default {
  title: 'Tree'
};

interface StaticTreeItemProps extends TreeItemProps {
  title?: string,
  children: ReactNode
}

// TODO replace Checkbox with the RSP versions. They will need to be modified to consume from RAC contexts
// Also note that they will mainly be handled by use, only the user provided buttons/elements that fit in the extra content section
// will be user provided. This means what I have below will need to be the internals and is then exposed to the user as a wrapper to which
// the user provides the <Text> and/or provides other elements as sibliings

interface ExpandableRowChevronProps {
  isExpanded?: boolean,
  isDisabled?: boolean
}

function ExpandableRowChevron(props: ExpandableRowChevronProps) {
  let expandButtonRef = useRef();
  let [fullProps, ref] = useContextProps({...props, slot: 'chevron'}, expandButtonRef, ButtonContext);
  let {direction} = useLocale();


  // Will need to keep the chevron as a button for iOS VO at all times since VO doesn't focus the cell. Also keep as button if cellAction is defined by the user in the future
  let {buttonProps} = useButton({
    ...fullProps,
    // // Desktop and mobile both toggle expansion of a native expandable row on mouse/touch up
    // onPress: () => {
    //   (state as TreeGridState<unknown>).toggleKey(cell.parentKey);
    //   if (!isFocusVisible()) {
    //     state.selectionManager.setFocused(true);
    //     state.selectionManager.setFocusedKey(cell.parentKey);
    //   }
    // },
    elementType: 'span'
  }, ref);

  return (
    <span
      {...buttonProps}
      ref={ref}
      // Override tabindex so that grid keyboard nav skips over it. Needs -1 so android talkback can actually "focus" it
      tabIndex={isAndroid() ? -1 : undefined}
      className={
        classNames(
          styles,
          'spectrum-Tree-expandButton',
          {
            'is-open': fullProps.isExpanded,
            'is-disabled': fullProps.isDisabled
          }
        )
      }>
      {direction === 'ltr' ? <ChevronRightMedium /> : <ChevronLeftMedium />}
    </span>
  );
}


// TODO: how are we going to tell between a static and dynamic case? I guess we would need to set up the TreeItemContent wrapper and Collection for the user. I guess we can check if the stuff passed to
// Tree itself is a function (aka dynamic) or not (aka static) and then use either of the below to decide whether to render using StaticTreeItem or DynamicTreeItem internally.

// For the styling of the padding per level, can just pass a direct style prop to the Checkbox that adds the desired margin instead of needing to add some kind of class
// For the additional styling of the Text, can just pass it via slots if need be
const StaticTreeItem = (props: StaticTreeItemProps) => {
  return (
    <TreeItem
      {...props}
      className={({isFocused, isSelected, isHovered, isFocusVisible, isPressed, isDisabled}) => classNames(styles, 'spectrum-Tree-row', {
        'is-focused': isFocused,
        'focus-visible': isFocusVisible,
        'is-selected': isSelected,
        'is-hovered': isHovered,
        'is-active': isPressed,
        'is-disabled': isDisabled
      })}>
      <TreeItemContent>
        {({isExpanded, hasChildRows, level, selectionMode, selectionBehavior, isDisabled}) => (
          <div className={classNames(styles, 'spectrum-Tree-cell-grid')}>
            {/* TODO refactor the below to match a single container with grid definition */}
            {selectionMode === 'multiple' && selectionBehavior === 'toggle' && (
              <Checkbox UNSAFE_className={classNames(styles, 'spectrum-Tree-checkbox')} UNSAFE_style={{marginInlineEnd: `calc(${level - 1} * var(--spectrum-global-dimension-size-200))`}} slot="selection" />
            )}
            {hasChildRows && <ExpandableRowChevron isDisabled={isDisabled} isExpanded={isExpanded} />}
            {/* TODO does this slot provider even work within RAC? Taken from ListView */}
            <SlotProvider
              slots={{
                text: {UNSAFE_className: classNames(styles, 'spectrum-Tree-content')},
                // TODO: handle the images later since we don't have a thumbnail component
                // illustration: {UNSAFE_className: styles['spectrum-ListViewItem-thumbnail']},
                // image: {UNSAFE_className: styles['react-spectrum-ListViewItem-thumbnail']},
                // TODO: handle action group and stuff the same way it is handled in ListView
                actionButton: {UNSAFE_className: classNames(styles, 'spectrum-Tree-actions'), isQuiet: true},
                actionGroup: {
                  UNSAFE_className: classNames(styles, 'spectrum-Tree-actions'),
                  isQuiet: true,
                  density: 'compact',
                  buttonLabelBehavior: 'hide'
                }
                // TODO handle action menu the same way as in ListView. Should it support a action menu?
                // actionMenu: {UNSAFE_className: styles['react-spectrum-ListViewItem-actionmenu'], isQuiet: true}
              }}>
              <Text>{props.title || props.children}</Text>
              <ActionGroup isDisabled={isDisabled}>
                <Item key="edit">
                  <Edit />
                  <Text>Edit</Text>
                </Item>
                <Item key="delete">
                  <Delete />
                  <Text>Delete</Text>
                </Item>
              </ActionGroup>
            </SlotProvider>
            <div className={classNames(styles, 'spectrum-Tree-row-outline')} />
          </div>
        )}
      </TreeItemContent>
      {props.title && props.children}
    </TreeItem>
  );
};





const expandButton = style<ExpandableRowChevronProps>({
  gridArea: 'expand-button',
  height: 'full',
  // TODO: check this one, might not need it
  aspectRatio: 'square',
  display: 'flex',
  flexWrap: 'wrap',
  alignContent: 'center',
  justifyContent: 'center',
  outlineStyle: 'none',
  color: {
    isDisabled: 'gray-400'
  },
  transform: {
    // TODO: need RTL
    isExpanded: 'rotate(90deg)'
  }
});

function ExpandableRowChevronMacros(props: ExpandableRowChevronProps) {
  let expandButtonRef = useRef();
  let [fullProps, ref] = useContextProps({...props, slot: 'chevron'}, expandButtonRef, ButtonContext);
  let {isExpanded, isDisabled} = fullProps;
  let {direction} = useLocale();


  // Will need to keep the chevron as a button for iOS VO at all times since VO doesn't focus the cell. Also keep as button if cellAction is defined by the user in the future
  let {buttonProps} = useButton({
    ...fullProps,
    // // Desktop and mobile both toggle expansion of a native expandable row on mouse/touch up
    // onPress: () => {
    //   (state as TreeGridState<unknown>).toggleKey(cell.parentKey);
    //   if (!isFocusVisible()) {
    //     state.selectionManager.setFocused(true);
    //     state.selectionManager.setFocusedKey(cell.parentKey);
    //   }
    // },
    elementType: 'span'
  }, ref);

  return (
    <span
      {...buttonProps}
      ref={ref}
      // Override tabindex so that grid keyboard nav skips over it. Needs -1 so android talkback can actually "focus" it
      tabIndex={isAndroid() ? -1 : undefined}
      className={expandButton({isExpanded, isDisabled})}>
      {direction === 'ltr' ? <ChevronRightMedium /> : <ChevronLeftMedium />}
    </span>
  );
}

const treeRow = style<TreeItemRenderProps>({
  position: 'relative',
  display: 'flex',
  height: 8,
  width: 'full',
  boxSizing: 'border-box',
  fontSize: 'base',
  fontWeight: 'normal',
  lineHeight: 200,
  color: 'body',
  outlineStyle: 'none',

  // TODO: not sure where to get the equivalent colors here, for instance isHovered is spectrum 600 with 10% opacity but I don't think that exists in the theme
  backgroundColor: {
    isHovered: '[var(--spectrum-table-row-background-color-hover)]',
    isFocused: '[var(--spectrum-table-row-background-color-hover)]',
    isPressed: '[var(--spectrum-table-row-background-color-down)]',
    isSelected: {
      default: '[var(--spectrum-table-row-background-color-selected)]',
      isHovered: '[var(--spectrum-table-row-background-color-hover)]',
      isPressed: '[var(--spectrum-table-row-background-color-hover)]'
    }
  }
});

const treeCellGrid = style({
  display: 'grid',
  width: 'full',
  alignItems: 'center',
  gridTemplateColumns: 'minmax(0, auto) minmax(0, auto) var(--spectrum-global-dimension-size-400) minmax(0, auto) 1fr minmax(0, auto)',
  gridTemplateRows: '1fr',
  gridTemplateAreas: [
    'drag-handle checkbox expand-button icon content actions'
  ]
});


// TODO: These styles lose against the spectrum class names, so I've did unsafe for the ones that get overridden
const treeCheckbox = style({
  gridArea: 'checkbox',
  transitionDuration: '160ms',
  paddingStart: '[var(--spectrum-global-dimension-size-150)]',
  paddingEnd: 0
});

const treeContent = style<Pick<TreeItemContentRenderProps, 'isDisabled'>>({
  gridArea: 'content',
  color: {
    isDisabled: 'gray-400'
  }
});

const treeActions = style({
  gridArea: 'actions',
  flexGrow: 0,
  flexShrink: 0,
  /* TODO: I made this one up, confirm desired behavior. These paddings are to make sure the action group has enough padding for the focus ring */
  paddingStart: '[var(--spectrum-global-dimension-size-50)]',
  paddingEnd: '[var(--spectrum-global-dimension-size-50)]'
});

const treeRowOutline = style({
  content: '',
  display: 'block',
  position: 'absolute',
  insetStart: 0,
  insetEnd: 0,
  top: {
    default: 0,
    isFocusVisible: '[-2px]',
    isSelected: {
      default: '[-1px]',
      isFocusVisible: '[-2px]',
    }
  },
  bottom: 0,
  pointerEvents: 'none',
  forcedColorAdjust: 'none',

  boxShadow: {
    isFocusVisible: '[inset 2px 0 0 0 var(--spectrum-alias-focus-color), inset -2px 0 0 0 var(--spectrum-alias-focus-color), inset 0 -2px 0 0 var(--spectrum-alias-focus-color), inset 0 2px 0 0 var(--spectrum-alias-focus-color)]',
    isSelected: {
      default: '[inset 1px 0 0 0 var(--spectrum-alias-focus-color), inset -1px 0 0 0 var(--spectrum-alias-focus-color), inset 0 -1px 0 0 var(--spectrum-alias-focus-color), inset 0 1px 0 0 var(--spectrum-alias-focus-color)]',
      isFocusVisible: '[inset 2px 0 0 0 var(--spectrum-alias-focus-color), inset -2px 0 0 0 var(--spectrum-alias-focus-color), inset 0 -2px 0 0 var(--spectrum-alias-focus-color), inset 0 2px 0 0 var(--spectrum-alias-focus-color)]'
    }
  }
})

const StaticTreeItemMacros = (props: StaticTreeItemProps) => {
  return (
    <TreeItem
      {...props}
      className={renderProps => treeRow({
        ...renderProps
      })}>
      <TreeItemContent>
        {({isExpanded, hasChildRows, level, selectionMode, selectionBehavior, isDisabled, isSelected, isFocusVisible}) => (
          <div className={treeCellGrid()}>
            {/* TODO refactor the below to match a single container with grid definition */}
            {selectionMode === 'multiple' && selectionBehavior === 'toggle' && (
              <Checkbox
                UNSAFE_className={treeCheckbox()}
                UNSAFE_style={{
                  marginInlineEnd: `calc(${level - 1} * var(--spectrum-global-dimension-size-200))`,
                  paddingInlineEnd: '0px'
                }}
                slot="selection" />
            )}
            {hasChildRows && <ExpandableRowChevronMacros isDisabled={isDisabled} isExpanded={isExpanded} />}
            <SlotProvider
              slots={{
                text: {UNSAFE_className: treeContent({isDisabled})},
                // TODO: handle the images later since we don't have a thumbnail component
                // illustration: {UNSAFE_className: styles['spectrum-ListViewItem-thumbnail']},
                // image: {UNSAFE_className: styles['react-spectrum-ListViewItem-thumbnail']},
                // TODO: handle action group and stuff the same way it is handled in ListView
                actionButton: {UNSAFE_className: treeActions(), isQuiet: true},
                actionGroup: {
                  UNSAFE_className: treeActions(),
                  isQuiet: true,
                  density: 'compact',
                  buttonLabelBehavior: 'hide'
                }
                // TODO handle action menu the same way as in ListView. Should it support a action menu?
                // actionMenu: {UNSAFE_className: styles['react-spectrum-ListViewItem-actionmenu'], isQuiet: true}
              }}>
              <Text>{props.title || props.children}</Text>
              <ActionGroup isDisabled={isDisabled}>
                <Item key="edit">
                  <Edit />
                  <Text>Edit</Text>
                </Item>
                <Item key="delete">
                  <Delete />
                  <Text>Delete</Text>
                </Item>
              </ActionGroup>
            </SlotProvider>
            <div className={treeRowOutline({isFocusVisible, isSelected})} />
          </div>
        )}
      </TreeItemContent>
      {props.title && props.children}
    </TreeItem>
  );
};



// TODO add a resizable wrapper around this but for now apply a widht and height
export const TreeExampleStatic = (args) => (
  <Flex>
    <Tree {...args} style={{height: '300px', width: '300px'}} disabledKeys={['projects-1']} aria-label="test static tree" onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
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
    </Tree>
    <Tree {...args} style={{height: '300px', width: '300px'}} disabledKeys={['projects-1']} aria-label="test static tree" onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
      <StaticTreeItemMacros id="Photos" textValue="Photos">Photos</StaticTreeItemMacros>
      <StaticTreeItemMacros id="projects" textValue="Projects" title="Projects">
        <StaticTreeItemMacros id="projects-1" textValue="Projects-1" title="Projects-1">
          <StaticTreeItemMacros id="projects-1A" textValue="Projects-1A">
            Projects-1A
          </StaticTreeItemMacros>
        </StaticTreeItemMacros>
        <StaticTreeItemMacros id="projects-2" textValue="Projects-2">
          Projects-2
        </StaticTreeItemMacros>
        <StaticTreeItemMacros id="projects-3" textValue="Projects-3">
          Projects-3
        </StaticTreeItemMacros>
      </StaticTreeItemMacros>
    </Tree>
  </Flex>
);

TreeExampleStatic.story = {
  args: {
    selectionMode: 'none',
    selectionBehavior: 'toggle',
    disabledBehavior: 'selection'
  },
  argTypes: {
    selectionMode: {
      control: {
        type: 'radio',
        options: ['none', 'single', 'multiple']
      }
    },
    selectionBehavior: {
      control: {
        type: 'radio',
        options: ['toggle', 'replace']
      }
    },
    disabledBehavior: {
      control: {
        type: 'radio',
        options: ['selection', 'all']
      }
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

interface DynamicTreeItemProps extends TreeItemProps<object> {
  children: ReactNode
}

const DynamicTreeItem = (props: DynamicTreeItemProps) => {
  let {childItems} = props;

  return (
    <TreeItem
      {...props}
      className={({isFocused, isSelected, isHovered, isFocusVisible}) => classNames(styles, 'spectrum-Tree-row', {
        focused: isFocused,
        'focus-visible': isFocusVisible,
        selected: isSelected,
        hovered: isHovered
      })}>
      <TreeItemContent>
        {({isExpanded, hasChildRows, level, selectionBehavior, selectionMode}) => (
          <>
            {selectionMode === 'multiple' && selectionBehavior === 'toggle' && (
              <MyCheckbox slot="selection" />
            )}
            <div className={styles['content-wrapper']} style={{marginInlineStart: `${(!hasChildRows ? 20 : 0) + (level - 1) * 15}px`}}>
              {hasChildRows && <Button slot="chevron">{isExpanded ? '⏷' : '⏵'}</Button>}
              <Text>{props.children}</Text>
              <Button className={styles.button} aria-label="Info" onPress={action('Info press')}>ⓘ</Button>
            </div>
          </>
        )}
      </TreeItemContent>
      <Collection items={childItems}>
        {(item: any) => (
          <DynamicTreeItem childItems={item.childItems} textValue={item.name} href={props.href}>
            {item.name}
          </DynamicTreeItem>
        )}
      </Collection>
    </TreeItem>
  );
};

export const TreeExampleDynamic = (args: TreeProps<unknown>) => (
  <Tree {...args} defaultExpandedKeys="all" disabledKeys={['reports-1AB']} className={styles.tree} aria-label="test dynamic tree" items={rows} onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
    {(item) => (
      <DynamicTreeItem childItems={item.childItems} textValue={item.name}>
        {item.name}
      </DynamicTreeItem>
    )}
  </Tree>
);

TreeExampleDynamic.story = {
  ...TreeExampleStatic.story,
  parameters: null
};
