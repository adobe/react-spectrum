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

import {
  ButtonContext,
  Collection,
  Provider,
  TreeItemProps as RACTreeItemProps,
  TreeProps as RACTreeProps,
  TreeItemRenderProps,
  UNSTABLE_Tree,
  UNSTABLE_TreeItem,
  UNSTABLE_TreeItemContent,
  useContextProps
} from 'react-aria-components';
import {Checkbox, IconContext, Text, TextContext} from '@react-spectrum/s2';
import Chevron from '../ui-icons/Chevron';
import {colorMix, lightDark, style} from '../style' with {type: 'macro'};
import {DOMRef, Key} from '@react-types/shared';
import {isAndroid} from '@react-aria/utils';
import {raw} from '../style/style-macro';
import React, {createContext, forwardRef, isValidElement, JSXElementConstructor, ReactElement, useContext, useRef} from 'react';
import {StylesPropWithHeight, UnsafeStyles} from './style-utils';
import {useButton} from '@react-aria/button';
import {useDOMRef} from '@react-spectrum/utils';
import {useLocale} from '@react-aria/i18n';

interface S2TreeProps {
  isDetached?: boolean,
  onAction?: (key: Key) => void
}

// should we remove disabledBehavior?
export interface TreeViewProps extends Omit<RACTreeProps<any>, 'style' | 'className' | 'onRowAction' | 'selectionBehavior' | 'onScroll' | 'onCellAction' | 'dragAndDropHooks'>, UnsafeStyles, S2TreeProps {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight
}

export interface TreeViewItemProps<T extends object = object> extends Omit<RACTreeItemProps, 'className' | 'style'> {
  /** Whether this item has children, even if not loaded yet. */
  hasChildItems?: boolean,
  /** A list of child tree item objects used when dynamically rendering the tree item children. */
  childItems?: Iterable<T>
}

interface TreeRendererContextValue {
  renderer?: (item) => ReactElement<any, string | JSXElementConstructor<any>>
}
const TreeRendererContext = createContext<TreeRendererContextValue>({});

function useTreeRendererContext(): TreeRendererContextValue {
  return useContext(TreeRendererContext)!;
}


let InternalTreeContext = createContext<{isDetached?: boolean}>({});

// TODO: the below is needed so the borders of the top and bottom row isn't cut off if the TreeView is wrapped within a container by always reserving the 2px needed for the
// keyboard focus ring. Perhaps find a different way of rendering the outlines since the top of the item doesn't
// scroll into view due to how the ring is offset. Alternatively, have the tree render the top/bottom outline like it does in Listview
const tree = style({
  borderWidth: 2,
  boxSizing: 'border-box',
  borderXWidth: 0,
  borderStyle: 'solid',
  borderColor: {
    default: 'transparent',
    forcedColors: 'Background'
  },
  justifyContent: {
    isEmpty: 'center'
  },
  alignItems: {
    isEmpty: 'center'
  },
  width: {
    isEmpty: 'full'
  },
  height: {
    isEmpty: 'full'
  },
  display: 'flex',
  flexDirection: 'column',
  gap: {
    isDetached: 2
  },
  '--indent': {
    type: 'width',
    value: 16
  }
});

function TreeView(props: TreeViewProps, ref: DOMRef<HTMLDivElement>) {
  let {children, isDetached} = props;

  let renderer;
  if (typeof children === 'function') {
    renderer = children;
  }

  let domRef = useDOMRef(ref);

  return (
    <TreeRendererContext.Provider value={{renderer}}>
      <InternalTreeContext.Provider value={{isDetached}}>
        <UNSTABLE_Tree
          {...props}
          className={({isEmpty}) => tree({isEmpty, isDetached})}
          selectionBehavior="toggle"
          ref={domRef}>
          {props.children}
        </UNSTABLE_Tree>
      </InternalTreeContext.Provider>
    </TreeRendererContext.Provider>
  );
}

interface TreeRowRenderProps extends TreeItemRenderProps {
  isLink?: boolean
}

const selectedBackground = lightDark(colorMix('gray-25', 'informative-900', 10), colorMix('gray-25', 'informative-700', 10));
const selectedActiveBackground = lightDark(colorMix('gray-25', 'informative-900', 15), colorMix('gray-25', 'informative-700', 15));

const rowBackgroundColor = {
  default: {
    default: 'gray-25',
    isQuiet: '--s2-container-bg'
  },
  isFocusVisibleWithin: colorMix('gray-25', 'gray-900', 7), // table-row-hover-color
  isHovered: colorMix('gray-25', 'gray-900', 7), // table-row-hover-color
  isPressed: colorMix('gray-25', 'gray-900', 10), // table-row-hover-color
  isSelected: {
    default: selectedBackground, // table-selected-row-background-color, opacity /10
    isFocusVisibleWithin: selectedActiveBackground, // table-selected-row-background-color, opacity /15
    isHovered: selectedActiveBackground, // table-selected-row-background-color, opacity /15
    isPressed: selectedActiveBackground // table-selected-row-background-color, opacity /15
  },
  forcedColors: {
    default: 'Background'
  }
} as const;

const treeRow = style({
  position: 'relative',
  display: 'flex',
  height: 40,
  width: 'full',
  minWidth: 240, // do we really want this restriction?
  boxSizing: 'border-box',
  font: 'ui',
  color: 'body',
  borderRadius: { // odd behaviour, if this is the last property, then bottom right isn't rounded
    isDetached: 'default'
  },
  outlineStyle: 'none',
  cursor: {
    default: 'default',
    isLink: 'pointer'
  },
  backgroundColor: '--rowBackgroundColor',
  '--rowBackgroundColor': {
    type: 'backgroundColor',
    value: rowBackgroundColor
  },
  '--rowFocusIndicatorColor': {
    type: 'outlineColor',
    value: {
      default: 'focus-ring',
      forcedColors: 'Highlight'
    }
  },
  borderTopWidth: 0,
  borderBottomWidth: 0,
  borderStartWidth: 0,
  borderEndWidth: 0,
  borderStyle: 'none'
});

const treeCellGrid = style({
  display: 'grid',
  width: 'full',
  alignItems: 'center',
  gridTemplateColumns: ['minmax(0, auto)', 'minmax(0, auto)', 'minmax(0, auto)', 40, 'minmax(0, auto)', '1fr'],
  gridTemplateRows: '1fr',
  gridTemplateAreas: [
    'drag-handle checkbox level-padding expand-button icon content'
  ],
  color: {
    isDisabled: {
      default: 'gray-400',
      forcedColors: 'GrayText'
    }
  }
});

const treeCheckbox = style({
  gridArea: 'checkbox',
  marginStart: 12,
  marginEnd: 0,
  paddingEnd: 0
});

const treeIcon = style({
  gridArea: 'icon',
  marginEnd: 'text-to-visual'
});

const treeContent = style({
  gridArea: 'content',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden'
});

const cellFocus = {
  outlineStyle: {
    default: 'none',
    isFocusVisible: 'solid'
  },
  outlineOffset: -2,
  outlineWidth: 2,
  outlineColor: 'focus-ring',
  borderRadius: '[6px]'
} as const;

export const TreeViewItem = <T extends object>(props: TreeViewItemProps<T>) => {
  let {
    children,
    childItems,
    hasChildItems,
    href
  } = props;

  let content;
  let nestedRows;
  let {renderer} = useTreeRendererContext();
  let {isDetached} = useContext(InternalTreeContext);
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
    // TODO right now all the tree rows have the various data attributes applied on their dom nodes, should they? Doesn't feel very useful
    <UNSTABLE_TreeItem
      {...props}
      className={renderProps => treeRow({
        ...renderProps,
        isDetached,
        isLink: !!href
      }) + (renderProps.isFocusVisible && !isDetached && ' ' + raw('&:before { content: ""; display: inline-block; position: sticky; inset-inline-start: 0; width: 3px; height: 100%; margin-inline-end: -3px; margin-block-end: 1px;  z-index: 3; background-color: var(--rowFocusIndicatorColor)'))}>
      <UNSTABLE_TreeItemContent>
        {({isExpanded, hasChildRows, selectionMode, selectionBehavior, isDisabled, isFocusVisible}) => (
          <div className={treeCellGrid({isDisabled})}>
            {selectionMode !== 'none' && selectionBehavior === 'toggle' && (
              // TODO: add transition?
              <div className={treeCheckbox}>
                <Checkbox
                  isEmphasized
                  slot="selection" />
              </div>
            )}
            <div
              className={style({
                gridArea: 'level-padding',
                width: '[calc(calc(var(--tree-item-level, 0) - 1) * var(--indent))]'
              })} />
            {/* TODO: revisit when we do async loading, at the moment hasChildItems will only cause the chevron to be rendered, no aria/data attributes indicating the row's expandability are added */}
            {(hasChildRows || hasChildItems) && <ExpandableRowChevron isDisabled={isDisabled} isExpanded={isExpanded} />}
            <Provider
              values={[
                [TextContext, {styles: treeContent}],
                [IconContext, {styles: treeIcon}]
              ]}>
              {content}
            </Provider>
            {isFocusVisible && isDetached && <div role="presentation" className={style({...cellFocus, position: 'absolute', inset: 0})({isFocusVisible: true})} />}
          </div>
        )}
      </UNSTABLE_TreeItemContent>
      {nestedRows}
    </UNSTABLE_TreeItem>
  );
};

interface ExpandableRowChevronProps {
  isExpanded?: boolean,
  isDisabled?: boolean,
  isRTL?: boolean
}

const expandButton = style<ExpandableRowChevronProps>({
  gridArea: 'expand-button',
  height: 'full',
  aspectRatio: 'square',
  display: 'flex',
  flexWrap: 'wrap',
  alignContent: 'center',
  justifyContent: 'center',
  outlineStyle: 'none',
  transform: {
    isExpanded: {
      default: 'rotate(90deg)',
      isRTL: 'rotate(-90deg)'
    }
  },
  transition: 'default'
});

function ExpandableRowChevron(props: ExpandableRowChevronProps) {
  let expandButtonRef = useRef<HTMLSpanElement>(null);
  // @ts-ignore - check back on this
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
      tabIndex={isAndroid() && !isDisabled ? -1 : undefined}
      className={expandButton({isExpanded, isDisabled, isRTL: direction === 'rtl'})}>
      <Chevron
        className={style({
          scale: {
            direction: {
              ltr: '1',
              rtl: '-1'
            }
          },
          '--iconPrimary': {
            type: 'fill',
            value: 'currentColor'
          }
        })({direction})} />
    </span>
  );
}

/**
 * A tree view provides users with a way to navigate nested hierarchical information.
 */
const _TreeView = forwardRef(TreeView);
export {_TreeView as TreeView};
