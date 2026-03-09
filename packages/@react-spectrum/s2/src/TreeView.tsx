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

import {ActionButtonGroupContext} from './ActionButtonGroup';
import {ActionMenuContext} from './ActionMenu';
import {baseColor, colorMix, focusRing, fontRelative, style} from '../style' with {type: 'macro'};
import {
  Button,
  ButtonContext,
  ListLayout,
  Provider,
  TreeItemProps as RACTreeItemProps,
  TreeProps as RACTreeProps,
  Tree,
  TreeItem,
  TreeItemContent,
  TreeItemContentProps,
  TreeLoadMoreItem,
  TreeLoadMoreItemProps,
  TreeState,
  useContextProps,
  Virtualizer
} from 'react-aria-components';
import {centerBaseline} from './CenterBaseline';
import {Checkbox} from './Checkbox';
import Chevron from '../ui-icons/Chevron';
import {DOMRef, forwardRefType, GlobalDOMAttributes, Key, LoadingState} from '@react-types/shared';
import {getAllowedOverrides, StylesPropWithHeight, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {IconContext} from './Icon';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ProgressCircle} from './ProgressCircle';
import {raw} from '../style/style-macro' with {type: 'macro'};
import React, {createContext, forwardRef, JSXElementConstructor, ReactElement, ReactNode, useContext, useRef} from 'react';
import {Text, TextContext} from './Content';
import {useActionBarContainer} from './ActionBar';
import {useDOMRef} from '@react-spectrum/utils';
import {useLocale, useLocalizedStringFormatter} from 'react-aria';
import {useScale} from './utils';

interface S2TreeProps {
  /** Handler that is called when a user performs an action on a row. */
  onAction?: (key: Key) => void,
  /** Provides the ActionBar to display when items are selected in the TreeView. */
  renderActionBar?: (selectedKeys: 'all' | Set<Key>) => ReactElement
}

interface TreeViewStyleProps {
  /**
   * How selection should be displayed.
   * @default 'checkbox'
   */
  selectionStyle?: 'highlight' | 'checkbox'
}

export interface TreeViewProps<T> extends Omit<RACTreeProps<T>, 'style' | 'className' | 'render' | 'onRowAction' | 'selectionBehavior' | 'onScroll' | 'onCellAction' | 'dragAndDropHooks' | keyof GlobalDOMAttributes>, UnsafeStyles, S2TreeProps, TreeViewStyleProps {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight
}

export interface TreeViewItemProps extends Omit<RACTreeItemProps, 'className' | 'style' | 'render' | 'onClick' | keyof GlobalDOMAttributes> {
  /** Whether this item has children, even if not loaded yet. */
  hasChildItems?: boolean
}

export interface TreeViewLoadMoreItemProps extends Pick<TreeLoadMoreItemProps, 'onLoadMore'> {
  /** The current loading state of the TreeView or TreeView row. */
  loadingState?: LoadingState
}

interface TreeRendererContextValue {
  renderer?: (item) => ReactElement<any, string | JSXElementConstructor<any>>
}
const TreeRendererContext = createContext<TreeRendererContextValue>({});


const treeViewWrapper = style({
  minHeight: 0,
  minWidth: 160,
  display: 'flex',
  isolation: 'isolate',
  disableTapHighlight: true,
  position: 'relative',
  overflow: 'clip'
}, getAllowedOverrides({height: true}));

// TODO: the below is needed so the borders of the top and bottom row isn't cut off if the TreeView is wrapped within a container by always reserving the 2px needed for the
// keyboard focus ring. Perhaps find a different way of rendering the outlines since the top of the item doesn't
// scroll into view due to how the ring is offset. Alternatively, have the tree render the top/bottom outline like it does in Listview
const tree = style({
  ...focusRing(),
  outlineOffset: -2, // make certain we are visible inside overflow hidden containers
  userSelect: 'none',
  minHeight: 0,
  minWidth: 0,
  width: 'full',
  height: 'full',
  overflow: 'auto',
  boxSizing: 'border-box',
  justifyContent: {
    isEmpty: 'center'
  },
  alignItems: {
    isEmpty: 'center'
  },
  '--indent': {
    type: 'width',
    value: 16
  }
});

let InternalTreeViewContext = createContext<{selectionStyle?: 'highlight' | 'checkbox'}>({});

/**
 * A tree view provides users with a way to navigate nested hierarchical information.
 */
export const TreeView = /*#__PURE__*/ (forwardRef as forwardRefType)(function TreeView<T extends object>(props: TreeViewProps<T>, ref: DOMRef<HTMLDivElement>) {
  let {children, selectionStyle = 'checkbox', UNSAFE_className, UNSAFE_style} = props;
  let scale = useScale();

  let renderer;
  if (typeof children === 'function') {
    renderer = children;
  }

  let domRef = useDOMRef(ref);
  let scrollRef = useRef<HTMLDivElement | null>(null);

  let {selectedKeys, onSelectionChange, actionBar, actionBarHeight} = useActionBarContainer({...props, scrollRef});

  return (
    <div
      ref={domRef}
      className={(UNSAFE_className ?? '') + treeViewWrapper(null, props.styles)}
      style={UNSAFE_style}>
      <Virtualizer
        layout={ListLayout}
        layoutOptions={{
          rowHeight: scale === 'large' ? 50 : 40
        }}>
        <TreeRendererContext.Provider value={{renderer}}>
          <InternalTreeViewContext.Provider value={{selectionStyle}}>
            <Tree
              {...props}
              style={{
                paddingBottom: actionBarHeight > 0 ? actionBarHeight + 8 : 0,
                scrollPaddingBottom: actionBarHeight > 0 ? actionBarHeight + 8 : 0
              }}
              className={tree}
              selectionBehavior={selectionStyle === 'highlight' ? 'replace' : 'toggle'}
              selectedKeys={selectedKeys}
              defaultSelectedKeys={undefined}
              onSelectionChange={onSelectionChange}
              ref={scrollRef}>
              {props.children}
            </Tree>
          </InternalTreeViewContext.Provider>
        </TreeRendererContext.Provider>
      </Virtualizer>
      {actionBar}
    </div>
  );
});

const rowBackgroundColor = {
  default: '--s2-container-bg',
  isFocusVisibleWithin: colorMix('gray-25', 'gray-900', 7),
  isHovered: colorMix('gray-25', 'gray-900', 7),
  isPressed: colorMix('gray-25', 'gray-900', 7),
  isSelected: {
    default: colorMix('gray-25', 'gray-900', 7),
    isFocusVisibleWithin: colorMix('gray-25', 'gray-900', 10),
    isHovered: colorMix('gray-25', 'gray-900', 10),
    isPressed: colorMix('gray-25', 'gray-900', 10)
  },
  forcedColors: {
    default: 'Background'
  }
} as const;

const treeRow = style({
  ...focusRing(),
  outlineOffset: -2,
  position: 'relative',
  display: 'flex',
  height: 40,
  width: 'full',
  boxSizing: 'border-box',
  font: 'ui',
  color: {
    default: baseColor('neutral-subdued'),
    isSelected: baseColor('neutral'),
    forcedColors: 'ButtonText'
  },
  cursor: {
    default: 'default',
    isLink: 'pointer'
  },
  '--rowBackgroundColor': {
    type: 'backgroundColor',
    value: rowBackgroundColor
  },
  '--borderRadiusTreeItem': {
    type: 'borderTopStartRadius',
    value: 'sm'
  },
  borderRadius: 'sm'
});

const treeCellGrid = style({
  display: 'grid',
  width: 'full',
  height: 'full',
  boxSizing: 'border-box',
  borderRadius: 'sm',
  alignContent: 'center',
  alignItems: 'center',
  gridTemplateColumns: ['auto', 'auto', 'auto', 'auto', 'auto', '1fr', 'minmax(0, auto)', 'auto'],
  gridTemplateRows: '1fr',
  gridTemplateAreas: [
    'drag-handle checkbox level-padding expand-button icon content actions actionmenu'
  ],
  paddingEnd: 4, // account for any focus rings on the last item in the cell
  color: {
    isDisabled: {
      default: 'gray-400',
      forcedColors: 'GrayText'
    }
  },
  '--rowSelectedBorderColor': {
    type: 'outlineColor',
    value: {
      default: 'gray-800',
      isFocusVisible: 'focus-ring',
      forcedColors: 'Highlight'
    }
  },
  '--rowForcedFocusBorderColor': {
    type: 'outlineColor',
    value: {
      default: 'focus-ring',
      forcedColors: 'Highlight'
    }
  },
  '--borderColor': {
    type: 'borderColor',
    value: {
      default: 'transparent',
      selectionStyle: {
        highlight: 'blue-900'
      },
      forcedColors: 'ButtonBorder'
    }
  }
});

const treeRowBackground = style({
  position: 'absolute',
  zIndex: -1,
  inset: 0,
  backgroundColor: {
    default: '--rowBackgroundColor',
    selectionStyle: {
      highlight: {
        isHovered: colorMix('gray-25', 'gray-900', 7),
        isPressed: colorMix('gray-25', 'gray-900', 7),
        isSelected: {
          default: colorMix('gray-25', 'blue-900', 10),
          isHovered: colorMix('gray-25', 'blue-900', 15),
          isFocusVisible: colorMix('gray-25', 'blue-900', 15)
        }
      }
    }
  },
  borderTopStartRadius: {
    default: '--borderRadiusTreeItem',
    isPreviousSelected: {
      default: '--borderRadiusTreeItem',
      isSelected: 'none'
    }
  },
  borderTopEndRadius: {
    default: '--borderRadiusTreeItem',
    isPreviousSelected: {
      default: '--borderRadiusTreeItem',
      isSelected: 'none'
    }
  },
  borderBottomStartRadius: {
    default: '--borderRadiusTreeItem',
    isNextSelected: {
      default: '--borderRadiusTreeItem',
      isSelected: 'none'
    }
  },
  borderBottomEndRadius: {
    default: '--borderRadiusTreeItem',
    isNextSelected: {
      default: '--borderRadiusTreeItem',
      isSelected: 'none'
    }
  },
  borderTopWidth: {
    default: 1,
    isPreviousSelected: 0
  },
  borderBottomWidth: {
    default: 1,
    isNextSelected: 0
  },
  borderStartWidth: 1,
  borderEndWidth: 1,
  borderStyle: 'solid',
  borderColor: {
    default: 'transparent',
    isSelected: '--borderColor'
  }
});

const treeCheckbox = style({
  gridArea: 'checkbox',
  marginStart: 12,
  marginEnd: 0,
  paddingEnd: 0,
  visibility: {
    default: 'visible',
    isDisabled: 'hidden'
  }
});

const treeIcon = style({
  gridArea: 'icon',
  marginEnd: 'text-to-visual',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

const treeContent = style({
  gridArea: 'content',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden'
});

const treeActions = style({
  gridArea: 'actions',
  /* TODO: I made this one up, confirm desired behavior. These paddings are to make sure the action group has enough padding for the focus ring */
  marginStart: 2,
  marginEnd: 4
});

const treeActionMenu = style({
  gridArea: 'actionmenu'
});

const treeRowFocusIndicator = raw(`
  &:before {
    content: "";
    display: inline-block;
    position: sticky;
    inset-inline-start: 0;
    width: 3px;
    height: 100%;
    margin-inline-end: -3px;
    margin-block-end: 1px;
    z-index: 3;
    background-color: var(--rowFocusIndicatorColor);
  }`
);

export const TreeViewItem = (props: TreeViewItemProps): ReactNode => {
  let {
    href
  } = props;

  return (
    <TreeItem
      {...props}
      className={(renderProps) => treeRow({
        ...renderProps,
        isLink: !!href,
        isPreviousSelected: isPrevSelected(renderProps.id, renderProps.state)
      }) + (renderProps.isFocusVisible ? ' ' + treeRowFocusIndicator : '')} />
  );
};

export interface TreeViewItemContentProps extends Omit<TreeItemContentProps, 'children'> {
  /** Rendered contents of the tree item or child items. */
  children: ReactNode
}

export const TreeViewItemContent = (props: TreeViewItemContentProps): ReactNode => {
  let {
    children
  } = props;
  let scale = useScale();

  let {selectionStyle} = useContext(InternalTreeViewContext);
  
  return (
    <TreeItemContent>
      {({isExpanded, hasChildItems, selectionMode, selectionBehavior, isDisabled, isSelected, id, state, isHovered, isFocusVisible}) => {
        return (
          <div className={treeCellGrid({isDisabled, isNextSelected: isNextSelected(id, state), isSelected, selectionStyle})}>
            <div className={treeRowBackground({isHovered, isFocusVisible, isSelected, selectionStyle, isNextSelected: isNextSelected(id, state), isPreviousSelected: isPrevSelected(id, state)})} />
            {selectionMode !== 'none' && selectionBehavior === 'toggle' && selectionStyle !== 'highlight' && (
              // TODO: add transition?
              <div className={treeCheckbox({isDisabled: isDisabled || !state.selectionManager.canSelectItem(id) || state.disabledKeys.has(id)})}>
                <Checkbox slot="selection" />
              </div>
            )}
            <div
              className={style({
                gridArea: 'level-padding',
                width: 'calc(calc(var(--tree-item-level, 0) - 1) * var(--indent))'
              })} />
            <ExpandableRowChevron isDisabled={isDisabled} isExpanded={isExpanded} scale={scale} isHidden={!(hasChildItems)} />
            <Provider
              values={[
                [TextContext, {styles: treeContent}],
                [IconContext, {
                  render: centerBaseline({slot: 'icon', styles: treeIcon}),
                  styles: style({size: fontRelative(20), flexShrink: 0})
                }],
                [ActionButtonGroupContext, {styles: treeActions, isDisabled}],
                [ActionMenuContext, {styles: treeActionMenu, isQuiet: true, isDisabled}]
              ]}>
              {typeof children === 'string' ? <Text>{children}</Text> : children}
            </Provider>
          </div>
        );
      }}
    </TreeItemContent>
  );
};

const centeredWrapper = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'full',
  height: 'full'
});

export const TreeViewLoadMoreItem = (props: TreeViewLoadMoreItemProps): ReactNode => {
  let {loadingState, onLoadMore} = props;
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  let isLoading = loadingState === 'loading' || loadingState === 'loadingMore';
  return (
    <TreeLoadMoreItem isLoading={isLoading} onLoadMore={onLoadMore} className={style({width: 'full', marginY: 4})}>
      {() => {
        return (
          <div className={centeredWrapper}>
            <ProgressCircle
              isIndeterminate
              aria-label={stringFormatter.format('table.loadingMore')} />
          </div>
        );
      }}
    </TreeLoadMoreItem>
  );
};

interface ExpandableRowChevronProps {
  isExpanded?: boolean,
  isDisabled?: boolean,
  isRTL?: boolean,
  scale: 'medium' | 'large',
  isHidden?: boolean
}

const expandButton = style<ExpandableRowChevronProps>({
  gridArea: 'expand-button',
  color: {
    default: 'inherit',
    isDisabled: {
      default: 'disabled',
      forcedColors: 'GrayText'
    }
  },
  height: 40,
  width: 40,
  display: 'flex',
  flexWrap: 'wrap',
  alignContent: 'center',
  justifyContent: 'center',
  outlineStyle: 'none',
  cursor: 'default',
  transform: {
    isExpanded: {
      default: 'rotate(90deg)',
      isRTL: 'rotate(-90deg)'
    }
  },
  padding: 0,
  transition: 'default',
  backgroundColor: 'transparent',
  borderStyle: 'none',
  disableTapHighlight: true,
  visibility: {
    isHidden: 'hidden'
  }
});

function ExpandableRowChevron(props: ExpandableRowChevronProps) {
  let expandButtonRef = useRef<HTMLButtonElement>(null);
  let [fullProps, ref] = useContextProps({...props, slot: 'chevron'}, expandButtonRef, ButtonContext);
  let {isExpanded, scale, isHidden} = fullProps;
  let {direction} = useLocale();

  return (
    <Button
      {...props}
      ref={ref}
      slot="chevron"
      className={renderProps => expandButton({...renderProps, isExpanded, isRTL: direction === 'rtl', scale, isHidden})}>
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
    </Button>
  );
}

function isNextSelected(id: Key | undefined, state: TreeState<unknown>) {
  if (id == null || !state) {
    return false;
  }
  let keyAfter = state.collection.getKeyAfter(id);

  // skip nodes that are not item nodes because the selection manager will map non-item nodes to their parent item before checking selection
  let node = keyAfter ? state.collection.getItem(keyAfter) : null;
  while (node && node.type !== 'item' && keyAfter) {
    keyAfter = state.collection.getKeyAfter(keyAfter);
    node = keyAfter ? state.collection.getItem(keyAfter) : null;
  }

  return keyAfter != null && state.selectionManager.isSelected(keyAfter);
}

function isPrevSelected(id: Key | undefined, state: TreeState<unknown>) {
  if (id == null || !state) {
    return false;
  }
  let keyBefore = state.collection.getKeyBefore(id);
  return keyBefore != null && state.selectionManager.isSelected(keyBefore);
}
