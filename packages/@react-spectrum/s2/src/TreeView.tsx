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
import {Button, ButtonContext} from 'react-aria-components/Button';
import {centerBaseline} from './CenterBaseline';
import {Checkbox} from './Checkbox';
import Chevron from '../ui-icons/Chevron';
import {DEFAULT_SLOT, Provider, useContextProps} from 'react-aria-components/slots';
import {DOMRef, DragItem, forwardRefType, GlobalDOMAttributes, ItemDropTarget, Key, LoadingState} from '@react-types/shared';
import DragHandle from '../ui-icons/DragHandle';
import {dragPreviewBadge, icon, iconCenterWrapper, InsertionIndicator, isFirstItem, isPrevSelected, label, S2ListLayout} from './ListView';
import {edgeToText} from '../style/spectrum-theme' with {type: 'macro'};
import {getAllowedOverrides, StylesPropWithHeight, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {IconContext} from './Icon';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ProgressCircle} from './ProgressCircle';
import {
  TreeItemProps as RACTreeItemProps,
  TreeProps as RACTreeProps,
  Tree,
  TreeItem,
  TreeItemContent,
  TreeItemContentProps,
  TreeItemRenderProps,
  TreeLoadMoreItem,
  TreeLoadMoreItemProps,
  TreeRenderProps
} from 'react-aria-components/Tree';
import React, {createContext, forwardRef, JSXElementConstructor, ReactElement, ReactNode, useContext, useRef} from 'react';
import {Text, TextContext} from './Content';
import {TreeState} from 'react-stately/useTreeState';
import {useActionBarContainer} from './ActionBar';
import {useDOMRef} from './useDOMRef';
import {useLocale} from 'react-aria/I18nProvider';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useScale} from './utils';
import {useVisuallyHidden} from 'react-aria/VisuallyHidden';
import {Virtualizer} from 'react-aria-components/Virtualizer';;

interface S2TreeProps {
  /** Handler that is called when a user performs an action on a row. */
  onAction?: (key: Key) => void,
  /** Provides the ActionBar to display when items are selected in the TreeView. */
  renderActionBar?: (selectedKeys: 'all' | Set<Key>) => ReactElement
}

interface TreeViewStyleProps {
  /**
   * How selection should be displayed. For guidance on when to use which option, refer to the [Spectrum](https://spectrum.adobe.com/page/tree-view/#Checkbox-or-highlight-selection-style) page.
   * @default 'checkbox'
   */
  selectionStyle?: 'highlight' | 'checkbox'
}

export interface TreeViewProps<T> extends Omit<RACTreeProps<T>, 'style' | 'className' | 'render' | 'onRowAction' | 'selectionBehavior' | 'onScroll' | 'onCellAction' | keyof GlobalDOMAttributes>, UnsafeStyles, S2TreeProps, TreeViewStyleProps {
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

// These are the same as ListView. we didn't have v3 tree dnd and dont have designs so to be adjusted later
const dropTargetBackground = colorMix('gray-25', 'blue-900', 10);
const rootDropSelectedRowBackground = colorMix('gray-25', 'blue-900', 28);
const rowDropBackground = colorMix('gray-25', 'blue-900', 10);
const rootRowDropStyles = {
  default: dropTargetBackground,
  isSelected: rootDropSelectedRowBackground,
  forcedColors: 'Background'
} as const;
const rowDropStyles = {
  default: rowDropBackground,
  isSelected: rowDropBackground,
  forcedColors: 'Background'
} as const;

// TODO: the below is needed so the borders of the top and bottom row isn't cut off if the TreeView is wrapped within a container by always reserving the 2px needed for the
// keyboard focus ring. Perhaps find a different way of rendering the outlines since the top of the item doesn't
// scroll into view due to how the ring is offset. Alternatively, have the tree render the top/bottom outline like it does in Listview
const tree = style<TreeRenderProps>({
  ...focusRing(),
  outlineOffset: -2, // make certain we are visible inside overflow hidden containers
  userSelect: 'none',
  minHeight: 0,
  minWidth: 0,
  width: 'full',
  height: 'full',
  overflow: 'auto',
  boxSizing: 'border-box',
  backgroundColor: {
    isDropTarget: {
      default: dropTargetBackground,
      forcedColors: 'Background'
    }
  },
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

// TODO: same as TableView, to update based on feedback
export let dragPreviewWrapper = style({
  position: 'relative'
});

export let dragPreviewCardBack = style({
  position: 'absolute',
  zIndex: -1,
  top: 4,
  left: 4,
  width: 200,
  height: 'full',
  borderRadius: 'default',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'blue-900',
  backgroundColor: 'gray-25'
});

let dragPreviewCard = style<{scale?: 'medium' | 'large'}>({
  boxSizing: 'border-box',
  paddingX: 0,
  paddingY: 8,
  backgroundColor: 'gray-25',
  color: baseColor('neutral'),
  position: 'relative',
  display: 'grid',
  // TODO update this per designs, maybe should look like ListView's? Same for tableview
  gridTemplateColumns: [edgeToText(40), 'auto', 'minmax(0, 1fr)', 'auto', edgeToText(40)],
  gridTemplateRows: '1fr',
  gridTemplateAreas: [
    '. icon label badge .'
  ],
  alignItems: 'baseline',
  minHeight: {
    default: 40,
    scale: {
      large: 50
    }
  },
  width: 200,
  borderRadius: 'default',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'blue-900'
});

export interface TreeDragPreviewProps {
  /** The currently dragged items, sourced from renderDragPreview. */
  items: DragItem[],
  /**
   * The contents of the drag preview. Supports the default text slot.
   * If no children are provided, defaults to the first drag item's plain text content.
   */
  children?: ReactNode
}

export function TreeViewDragPreview(props: TreeDragPreviewProps) {
  let {items} = props;
  let isDraggingMultiple = items.length > 1;
  let itemLabel = items[0]?.['text/plain'] ?? '';
  let scale = useScale();

  return (
    <div
      className={dragPreviewWrapper}>
      {isDraggingMultiple && <div className={dragPreviewCardBack} />}
      <div className={dragPreviewCard({scale})}>
        <Provider
          values={[
            [TextContext, {
              slots: {
                [DEFAULT_SLOT]: {styles: label({})}
              }
            }],
            [IconContext, {
              slots: {
                icon: {render: centerBaseline({slot: 'icon', styles: iconCenterWrapper}), styles: icon}
              }
            }]
          ]}>
          {props.children ?? <Text>{itemLabel}</Text>}
          {isDraggingMultiple && (
            <div className={dragPreviewBadge}>{items.length}</div>
          )}
        </Provider>
      </div>
    </div>
  );
}

let InternalTreeViewContext = createContext<{selectionStyle?: 'highlight' | 'checkbox'}>({});

/**
 * A tree view provides users with a way to navigate nested hierarchical information.
 */
export const TreeView = /*#__PURE__*/ (forwardRef as forwardRefType)(function TreeView<T extends object>(props: TreeViewProps<T>, ref: DOMRef<HTMLDivElement>) {
  let {children, selectionStyle = 'checkbox', UNSAFE_className, UNSAFE_style, dragAndDropHooks} = props;
  let scale = useScale();

  if (dragAndDropHooks && dragAndDropHooks.renderDragPreview == null) {
    dragAndDropHooks.renderDragPreview = (items) => <TreeViewDragPreview items={items} />;
  }

  if (dragAndDropHooks) {
    dragAndDropHooks.renderDropIndicator = (target) => <InsertionIndicator target={target as ItemDropTarget} />;
  }

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
        layout={S2ListLayout}
        layoutOptions={{
          rowHeight: scale === 'large' ? 50 : 40,
          dropIndicatorThickness: 12
        }}>
        <TreeRendererContext.Provider value={{renderer}}>
          <InternalTreeViewContext.Provider value={{selectionStyle}}>
            <Tree
              {...props}
              dragAndDropHooks={dragAndDropHooks}
              style={{
                paddingBottom: actionBarHeight > 0 ? actionBarHeight + 8 : 0,
                scrollPaddingBottom: actionBarHeight > 0 ? actionBarHeight + 8 : 0
              }}
              className={(renderProps) => tree(renderProps)}
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

const treeRow = style<TreeItemRenderProps & {isLink?: boolean, isPreviousSelected?: boolean}>({
  // TODO: check these styles
  outlineStyle: {
    default: 'none',
    isDropTarget: 'solid'
  },
  outlineWidth: {
    isDropTarget: 2
  },
  outlineOffset: {
    isDropTarget: -2
  },
  outlineColor: {
    isDropTarget: 'blue-800',
    forcedColors: {
      isDropTarget: 'Highlight'
    }
  },
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
  // TODO: will have to update these to match design
  gridTemplateColumns: [4, 'auto', 'auto', 'auto', 'auto', 'auto', '1fr', 'minmax(0, auto)', 'auto'],
  gridTemplateRows: '1fr',
  gridTemplateAreas: [
    '. drag-handle checkbox level-padding expand-button icon content actions actionmenu'
  ],
  paddingEnd: 4, // account for any focus rings on the last item in the cell
  color: {
    isDisabled: {
      default: 'gray-400',
      forcedColors: 'GrayText'
    },
    forcedColors: 'ButtonText',
    selectionStyle: {
      highlight: {
        isSelected: {
          forcedColors: 'HighlightText'
        }
      }
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
  },
  forcedColorAdjust: 'none'
});

const treeRowBackground = style({
  position: 'absolute',
  zIndex: -1,
  inset: 0,
  backgroundColor: {
    default: '--rowBackgroundColor',
    forcedColors: 'Background',
    ':is([role="treegrid"][data-drop-target] *)': rootRowDropStyles,
    isDropTarget: rowDropStyles,
    selectionStyle: {
      highlight: {
        default: '--rowBackgroundColor',
        isSelected: {
          default: colorMix('gray-25', 'blue-900', 10),
          isHovered: colorMix('gray-25', 'blue-900', 15),
          isPressed: colorMix('gray-25', 'blue-900', 15),
          isFocusVisible: colorMix('gray-25', 'blue-900', 15),
          forcedColors: 'Highlight'
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
  marginStart: 8,
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

const treeDragButtonContainer = style({
  gridArea: 'drag-handle',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 10
});

const treeDragButton = style({
  alignItems: 'center',
  justifyContent: 'center',
  height: 22,
  width: 10,
  padding: 0,
  margin: 0,
  backgroundColor: 'transparent',
  borderStyle: 'none',
  borderRadius: 'sm',
  outlineStyle: {
    default: 'none',
    isFocusVisible: 'solid'
  },
  outlineColor: {
    default: 'focus-ring',
    forcedColors: 'Highlight'
  },
  outlineWidth: 2,
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

let treeRowFocusRing = style({
  ...focusRing(),
  outlineOffset: {
    default: -2,
    forcedColors: -3
  },
  outlineWidth: {
    default: 2,
    forcedColors: '[3px]'
  },
  outlineColor: {
    default: 'focus-ring',
    forcedColors: 'Highlight',
    selectionStyle: {
      highlight: {
        default: 'focus-ring',
        forcedColors: 'ButtonBorder'
      }
    }
  },
  position: 'absolute',
  inset: 0,
  top: {
    default: '[-1px]',
    isFirstItem: 0
  },
  bottom: {
    selectionStyle: {
      checkbox: 0,
      highlight: {
        default: 0,
        isNextSelected: '[-1px]',
        isSelected: {
          default: 0,
          isNextSelected: 0
        }
      }
    }
  },
  borderRadius: 'sm',
  zIndex: 1,
  pointerEvents: 'none'
});

export const TreeViewItem = (props: TreeViewItemProps): ReactNode => {
  let {
    href
  } = props;
  // let {selectionStyle} = useContext(InternalTreeViewContext);

  return (
    <TreeItem
      {...props}
      className={(renderProps) => treeRow({
        ...renderProps,
        isLink: !!href
        // TODO: don't think we need these?
        // selectionStyle,
        // isPreviousSelected: isPrevSelected(renderProps.id, renderProps.state)
      })} />
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
  let {visuallyHiddenProps} = useVisuallyHidden();

  return (
    (<TreeItemContent>
      {({isExpanded, hasChildItems, selectionMode, selectionBehavior, isDisabled, isSelected, id, state, isHovered, isFocusVisible, isFocusVisibleWithin, allowsDragging, isDropTarget}) => {
        return (
          (<div className={treeCellGrid({isDisabled, isNextSelected: isNextSelected(id, state), isSelected, selectionStyle})}>
            <div className={treeRowBackground({isHovered, isFocusVisible, isSelected, selectionStyle, isNextSelected: isNextSelected(id, state), isPreviousSelected: isPrevSelected(id, state), isDropTarget})} />
            {isFocusVisible && <div className={treeRowFocusRing({isFocusVisible, selectionStyle, isSelected, isNextSelected: isNextSelected(id, state), isFirstItem: isFirstItem(id, state)})} />}
            {allowsDragging && (
              <div className={treeDragButtonContainer}>
                {!isDisabled && (
                  <Button
                    slot="drag"
                    style={!isFocusVisibleWithin && !isFocusVisible && !isHovered ? {...visuallyHiddenProps.style} : {}}
                    className={treeDragButton}>
                    <DragHandle size="M" />
                  </Button>
                )}
              </div>
            )}
            {selectionMode !== 'none' && selectionBehavior === 'toggle' && selectionStyle !== 'highlight' && (
              // TODO: add transition?
              (<div className={treeCheckbox({isDisabled: isDisabled || !state.selectionManager.canSelectItem(id) || state.disabledKeys.has(id)})}>
                <Checkbox slot="selection" />
              </div>)
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
          </div>)
        );
      }}
    </TreeItemContent>)
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

  // We need to skip non-item nodes because the selection manager will map non-item nodes to their parent before checking selection
  let node = keyAfter ? state.collection.getItem(keyAfter) : null;
  while (node && node.type !== 'item' && keyAfter) {
    keyAfter = state.collection.getKeyAfter(keyAfter);
    node = keyAfter ? state.collection.getItem(keyAfter) : null;
  }

  return keyAfter != null && state.selectionManager.isSelected(keyAfter);
}
