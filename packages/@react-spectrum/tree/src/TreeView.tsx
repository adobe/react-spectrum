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


import {AriaTreeGridListProps} from '@react-aria/tree';
import {ButtonContext, Collection, Tree, TreeItem, TreeItemContent, TreeItemContentRenderProps, TreeItemProps, TreeItemRenderProps, useContextProps} from 'react-aria-components';
import {Checkbox} from '@react-spectrum/checkbox';
import ChevronLeftMedium from '@spectrum-icons/ui/ChevronLeftMedium';
import ChevronRightMedium from '@spectrum-icons/ui/ChevronRightMedium';
import {DOMRef, Expandable, Key, SpectrumSelectionProps, StyleProps} from '@react-types/shared';
import {isAndroid} from '@react-aria/utils';
import React, {createContext, isValidElement, ReactElement, ReactNode, useContext, useRef} from 'react';
import {SlotProvider, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {style} from '@react-spectrum/style-macro-s1' with {type: 'macro'};
import {Text} from '@react-spectrum/text';
import {useButton} from '@react-aria/button';
import {useLocale} from '@react-aria/i18n';

export interface SpectrumTreeViewProps<T> extends Omit<AriaTreeGridListProps<T>, 'children'>, StyleProps, SpectrumSelectionProps, Expandable {
  /** Provides content to display when there are no items in the tree. */
  renderEmptyState?: () => JSX.Element,
  /**
   * Handler that is called when a user performs an action on an item. The exact user event depends on
   * the collection's `selectionStyle` prop and the interaction modality.
   */
  onAction?: (key: Key) => void,
  /**
   * The contents of the tree.
   */
  children?: ReactNode | ((item: T) => ReactNode)
}

// TODO: I removed title since tree rows can have action buttons and stuff unlike other instances of items that use title (aka Sections and Columns) that typically don't have
// any other content that their internal text content
// TODO: write tests for all of these props to make sure things are propagating
export interface SpectrumTreeViewItemProps extends Omit<TreeItemProps, 'className' | 'style' | 'value'> {
  /** Rendered contents of the tree item or child items. */
  children: ReactNode,
  /** Whether this item has children, even if not loaded yet. */
  hasChildItems?: boolean
}

interface TreeRendererContextValue {
  renderer?: (item) => React.ReactElement<any, string | React.JSXElementConstructor<any>>
}
const TreeRendererContext = createContext<TreeRendererContextValue>({});

function useTreeRendererContext(): TreeRendererContextValue {
  return useContext(TreeRendererContext)!;
}

// TODO: the below is needed so the borders of the top and bottom row isn't cut off if the TreeView is wrapped within a container by always reserving the 2px needed for the
// keyboard focus ring
const tree = style({
  borderWidth: 2,
  boxSizing: 'border-box',
  borderXWidth: 0,
  borderStyle: 'solid',
  borderColor: 'transparent'
});

function TreeView<T extends object>(props: SpectrumTreeViewProps<T>, ref: DOMRef<HTMLDivElement>) {
  let {children} = props;

  let renderer;
  if (typeof children === 'function') {
    renderer = children;
  }

  let {styleProps} = useStyleProps(props);
  let domRef = useDOMRef(ref);

  return (
    <TreeRendererContext.Provider value={{renderer}}>
      <Tree {...props} {...styleProps} className={tree()} ref={domRef}>
        {props.children}
      </Tree>
    </TreeRendererContext.Provider>
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
  gridTemplateColumns: ['minmax(0, auto)', 'minmax(0, auto)', 'minmax(0, auto)', 8, 'minmax(0, auto)', '1fr', 'minmax(0, auto)'],
  gridTemplateRows: '1fr',
  gridTemplateAreas: [
    'drag-handle checkbox level-padding expand-button icon content actions'
  ]
});

// TODO: These styles lose against the spectrum class names, so I've did unsafe for the ones that get overridden
const treeCheckbox = style({
  gridArea: 'checkbox',
  transitionDuration: '160ms',
  paddingStart: 3,
  paddingEnd: 0
});

const treeIcon = style({
  gridArea: 'icon',
  paddingEnd: 2
});


const treeContent = style<Pick<TreeItemContentRenderProps, 'isDisabled'>>({
  gridArea: 'content',
  color: {
    isDisabled: 'gray-400'
  },
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden'
});

const treeActions = style({
  gridArea: 'actions',
  flexGrow: 0,
  flexShrink: 0,
  /* TODO: I made this one up, confirm desired behavior. These paddings are to make sure the action group has enough padding for the focus ring */
  paddingStart: .5,
  paddingEnd: .5
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
      isFocusVisible: '[-2px]'
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
});

export const TreeViewItem = (props: SpectrumTreeViewItemProps) => {
  let {
    children,
    childItems,
    hasChildItems
  } = props;

  let content;
  let nestedRows;
  let {renderer} = useTreeRendererContext();
  // TODO alternative api is that we have a separate prop for the TreeItems contents and expect the child to then be
  // a nested tree item

  if (typeof children === 'string') {
    content = <Text>{children}</Text>;
  } else {
    content = [];
    nestedRows = [];
    React.Children.forEach(children, node => {
      if (isValidElement(node) && node.type === TreeViewItem) {
        nestedRows.push(node);
      } else {
        content.push(node);
      }
    });
  }

  if (childItems != null && renderer) {
    nestedRows = (
      <Collection items={childItems}>
        {renderer}
      </Collection>
    );
  }

  return (
    <TreeItem
      {...props}
      className={renderProps => treeRow({
        ...renderProps
      })}>
      <TreeItemContent>
        {({isExpanded, hasChildRows, level, selectionMode, selectionBehavior, isDisabled, isSelected, isFocusVisible}) => (
          <div className={treeCellGrid()}>
            {selectionMode === 'multiple' && selectionBehavior === 'toggle' && (
              // TODO: add transition?
              <Checkbox
                UNSAFE_className={treeCheckbox()}
                UNSAFE_style={{paddingInlineEnd: '0px'}}
                slot="selection" />
            )}
            <div style={{gridArea: 'level-padding', marginInlineEnd: `calc(${level - 1} * var(--spectrum-global-dimension-size-200))`}} />
            {(hasChildRows || hasChildItems) && <ExpandableRowChevronMacros isDisabled={isDisabled} isExpanded={isExpanded} />}
            <SlotProvider
              slots={{
                text: {UNSAFE_className: treeContent({isDisabled})},
                icon: {UNSAFE_className: treeIcon(), size: 'S'},
                actionButton: {UNSAFE_className: treeActions(), isQuiet: true},
                actionGroup: {
                  UNSAFE_className: treeActions(),
                  isQuiet: true,
                  density: 'compact',
                  buttonLabelBehavior: 'hide',
                  isDisabled,
                  overflowMode: 'collapse'
                }
                // TODO handle action menu the same way as in ListView. Should it support a action menu?
                // actionMenu: {UNSAFE_className: styles['react-spectrum-ListViewItem-actionmenu'], isQuiet: true}
              }}>
              {content}
            </SlotProvider>
            <div className={treeRowOutline({isFocusVisible, isSelected})} />
          </div>
        )}
      </TreeItemContent>
      {nestedRows}
    </TreeItem>
  );
};

interface ExpandableRowChevronProps {
  isExpanded?: boolean,
  isDisabled?: boolean
}

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

/**
 * A tree view provides users with a way to navigate nested hierarchical information.
 */
const _TreeView = React.forwardRef(TreeView) as <T>(props: SpectrumTreeViewProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;
export {_TreeView as TreeView};
