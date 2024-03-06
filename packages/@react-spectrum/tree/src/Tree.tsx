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


import React, {createContext, isValidElement, ReactNode, useContext, useMemo, useRef} from 'react';
import {style} from '@react-spectrum/style-macro-s1' with {type: 'macro'};
import {ButtonContext, Collection, Tree, TreeItem, TreeItemContent, TreeItemContentRenderProps, TreeItemProps, TreeItemRenderProps, TreeProps, useContextProps} from 'react-aria-components';
import {Checkbox} from '@react-spectrum/checkbox';
import ChevronLeftMedium from '@spectrum-icons/ui/ChevronLeftMedium';
import ChevronRightMedium from '@spectrum-icons/ui/ChevronRightMedium';
import {isAndroid} from '@react-aria/utils';
import {Text} from '@react-spectrum/text';
import {useButton} from '@react-aria/button';
import {useLocale} from '@react-aria/i18n';
import {SlotProvider, useStyleProps} from '@react-spectrum/utils';
import {SpectrumSelectionProps, StyleProps} from '@react-types/shared';


// TODO: bring in TreeProps but only what we actually want from there, add to index
export interface SpectrumTreeViewProps extends StyleProps, SpectrumSelectionProps  {

}

// TODO: export this too
interface TreeViewItemProps extends TreeItemProps {
  title?: string,
  children: ReactNode
}

// TODO export the TreeItem as Item and move to index file instead
export {TreeViewItem as Item};

interface TreeRendererContextValue {
  renderer?: (item) => React.ReactElement<any, string | React.JSXElementConstructor<any>>
}
const TreeRendererContext = createContext<TreeRendererContextValue>({});

function useTreeRendererContext(): TreeRendererContextValue {
  return useContext(TreeRendererContext)!;
}

// TODO rename file to TreeView
// TODO figure out props
export function TreeView<T>(props: SpectrumTreeViewProps) {
  let {children} = props;
  // TODO use styleProps and pass to Tree

  let renderer;
  if (typeof children === 'function') {
    renderer = children;
  }

  let {styleProps} = useStyleProps(props);
  return (
    <TreeRendererContext.Provider value={{renderer}}>
      <Tree {...props} {...styleProps}>
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
  gridTemplateColumns: 'minmax(0, auto) minmax(0, auto) minmax(0, auto) var(--spectrum-global-dimension-size-400) minmax(0, auto) 1fr minmax(0, auto)',
  gridTemplateRows: '1fr',
  gridTemplateAreas: [
    'drag-handle checkbox level-padding expand-button icon content actions'
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

// TODO see if we can repurpose this to also suit the dynamic case
const TreeViewItem = (props: TreeViewItemProps) => {
  let {
    children,
    childItems
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

  // TODO: how do we tell what should be passed to the tree item in the Collection here? we don't know the format of childItmes? I guess we need to grab the renderer?
  if (childItems != null && renderer) {
    nestedRows = (
      <Collection items={childItems}>
        {renderer}
      </Collection>
    )
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
              <Checkbox
                UNSAFE_className={treeCheckbox()}
                UNSAFE_style={{
                  marginInlineEnd: '0px',
                  paddingInlineEnd: '0px'
                }}
                slot="selection" />
            )}
            <div style={{gridArea: 'level-padding', marginInlineEnd: `calc(${level - 1} * var(--spectrum-global-dimension-size-200))`}} />
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
                  buttonLabelBehavior: 'hide',
                  isDisabled
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
      {/* If user provided a prop.title, this means the child of said item is a nested item
      {title && children} */}
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
