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
import {Button, ButtonContext, Collection, Text, Tree, TreeItem, TreeItemContent, TreeItemProps, TreeProps, useContextProps} from 'react-aria-components';
import {Checkbox} from '@react-spectrum/checkbox';
import ChevronLeftMedium from '@spectrum-icons/ui/ChevronLeftMedium';
import ChevronRightMedium from '@spectrum-icons/ui/ChevronRightMedium';
import {SlotProvider, classNames} from '@react-spectrum/utils';
import Delete from '@spectrum-icons/workflow/Delete';
import Edit from '@spectrum-icons/workflow/Edit';
import {isAndroid} from '@react-aria/utils';
import React, {ReactNode, useRef} from 'react';
import styles from './styles.css';
import {useButton} from '@react-aria/button';
import {useLocale} from '@react-aria/i18n';


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

// The chevron button will be a custom implementation like it is in TableView so no need to provide slot to the RSP Button. It just needs to consume from ButtonContext and have
// the chevron slot

// function MyCheckbox({children, ...props}: CheckboxProps) {
//   return (
//     <Checkbox {...props}>
//       {({isIndeterminate}) => (
//         <>
//           <div className="checkbox">
//             <svg viewBox="0 0 18 18" aria-hidden="true">
//               {isIndeterminate
//                 ? <rect x={1} y={7.5} width={15} height={3} />
//                 : <polyline points="1 9 7 14 15 4" />}
//             </svg>
//           </div>
//           {children}
//         </>
//       )}
//     </Checkbox>
//   );
// }

// TODO: the props here is just isExpanded for now since it will come from the render props
interface ExpandableRowChevronProps {
  isExpanded?: boolean
}

function ExpandableRowChevron(props: ExpandableRowChevronProps) {
  let expandButtonRef = useRef();
  let [fullProps, ref] = useContextProps({...props, slot: 'chevron'}, expandButtonRef, ButtonContext);
    // TODO: move some/all of the chevron button setup into a separate hook?
  let {direction} = useLocale();
  // let {state} = useTableContext();


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
      // TODO: replace with appropriate classNames
      className={
        classNames(
          styles,
          'spectrum-Tree-expandButton',
          {
            'is-open': fullProps.isExpanded
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
      className={({isFocused, isSelected, isHovered, isFocusVisible}) => classNames(styles, 'spectrum-Tree-row', {
        focused: isFocused,
        'focus-visible': isFocusVisible,
        selected: isSelected,
        hovered: isHovered
      })}>
      <TreeItemContent>
        {({isExpanded, hasChildRows, level, selectionMode, selectionBehavior}) => (
          <>
            {/* TODO refactor the below to match a single container with grid definition */}
            {selectionMode === 'multiple' && selectionBehavior === 'toggle' && (
              <Checkbox UNSAFE_className={classNames(styles, 'spectrum-Tree-checkbox')} slot="selection" />
            )}
            {hasChildRows && <ExpandableRowChevron isExpanded={isExpanded} />}
            {/* TODO does this slot provider even work within RAC? Taken from ListView */}
            <SlotProvider
              slots={{
                text: {UNSAFE_className: styles['react-spectrum-Tree-content']},
                illustration: {UNSAFE_className: styles['react-spectrum-ListViewItem-thumbnail']},
                image: {UNSAFE_className: styles['react-spectrum-ListViewItem-thumbnail']},
                actionButton: {UNSAFE_className: styles['react-spectrum-Tree-actions'], isQuiet: true},
                actionGroup: {
                  // UNSAFE_className: styles['react-spectrum-ListViewItem-actions'],
                  UNSAFE_className: 'gawkjegnkawjegb',
                  isQuiet: true,
                  density: 'compact'
                },
                actionMenu: {UNSAFE_className: styles['react-spectrum-ListViewItem-actionmenu'], isQuiet: true}
              }}>
              <Text className={styles.title}>{props.title || props.children}</Text>
              <ActionGroup buttonLabelBehavior="hide">
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
            {/* <Button className={styles.button} aria-label="Info" onPress={action('Info press')}>ⓘ</Button>
            <Button className={styles.button} aria-label="Edit" onPress={action('Edit press')}>ⓘ</Button> */}
          </>
        )}
      </TreeItemContent>
      {props.title && props.children}
    </TreeItem>
  );
};



// const StaticTreeItem = (props: StaticTreeItemProps) => {
//   return (
//     <TreeItem
//       {...props}
//       className={({isFocused, isSelected, isHovered, isFocusVisible}) => classNames(styles, 'spectrum-Tree-row', {
//         focused: isFocused,
//         'focus-visible': isFocusVisible,
//         selected: isSelected,
//         hovered: isHovered
//       })}>
//       <TreeItemContent>
//         {({isExpanded, hasChildRows, level, selectionMode, selectionBehavior}) => (
//           <>
//             {/* TODO refactor the below to match a single container with grid definition */}
//             {selectionMode === 'multiple' && selectionBehavior === 'toggle' && (
//               <Checkbox slot="selection" />
//             )}
//             <div
//               className={classNames(styles, 'content-wrapper')}
//               style={{marginInlineStart: `${(!hasChildRows ? 20 : 0) + (level - 1) * 15}px`}}>
//               {hasChildRows && <ExpandableRowChevron isExpanded={isExpanded} />}
//               <Text className={styles.title}>{props.title || props.children}</Text>
//               <Button className={styles.button} aria-label="Info" onPress={action('Info press')}>ⓘ</Button>
//             </div>
//           </>
//         )}
//       </TreeItemContent>
//       {props.title && props.children}
//     </TreeItem>
//   );
// };

export const TreeExampleStatic = (args) => (
  <Tree  className={styles.tree} {...args} disabledKeys={['projects']} aria-label="test static tree" onExpandedChange={action('onExpandedChange')} onSelectionChange={action('onSelectionChange')}>
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
      className={({isFocused, isSelected, isHovered, isFocusVisible}) => classNames(styles, 'spectrum-Tree-row', {
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
      className={({isFocused, isSelected, isHovered, isFocusVisible}) => classNames(styles, 'spectrum-Tree-row', {
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
