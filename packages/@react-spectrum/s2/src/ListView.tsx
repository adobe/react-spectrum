/*
 * Copyright 2026 Adobe. All rights reserved.
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
import {
  baseColor,
  color,
  colorMix,
  focusRing,
  fontRelative,
  space,
  style
} from '../style' with {type: 'macro'};
import {centerBaseline} from './CenterBaseline';
import {Checkbox} from './Checkbox';
import {CheckboxContext} from 'react-aria-components/Checkbox';
import Chevron from '../ui-icons/Chevron';
import {Collection} from 'react-aria/Collection';
import {
  CollectionRendererContext,
  DefaultCollectionRenderer
} from 'react-aria-components/CollectionBuilder';
import {
  ContextValue,
  DEFAULT_SLOT,
  Provider,
  SlotProps,
  useSlottedContext
} from 'react-aria-components/slots';
import {
  controlFont,
  getAllowedOverrides,
  StylesPropWithHeight,
  UnsafeStyles
} from './style-utils' with {type: 'macro'};
import {createContext, forwardRef, ReactElement, ReactNode, useContext, useRef} from 'react';
import {css} from '../style/style-macro' with {type: 'macro'};
import {description, DragPreview, icon, iconCenterWrapper, label} from './DragPreview';
import {
  DOMProps,
  DOMRef,
  DOMRefValue,
  forwardRefType,
  GlobalDOMAttributes,
  ItemDropTarget,
  LoadingState
} from '@react-types/shared';
import {DragHandleButton, InsertionIndicator} from './dnd-utils';
import {
  GridList,
  GridListItem,
  GridListItemProps,
  GridListItemRenderProps,
  GridListLoadMoreItem,
  GridListProps,
  GridListRenderProps
} from 'react-aria-components/GridList';
import {IconContext} from './Icon';
import {ImageContext} from './Image';
import intlMessages from '../intl/*.json';
import {Key} from '@react-types/shared';
import {LayoutInfo, Virtualizer} from 'react-aria-components/Virtualizer';
import LinkOutIcon from '../ui-icons/LinkOut';
import {ListLayout} from 'react-stately/useVirtualizerState';
import type {ListState} from 'react-stately/useListState';
import {ProgressCircle} from './ProgressCircle';
import {Text, TextContext} from './Content';
import {useActionBarContainer} from './ActionBar';
import {useDOMRef} from './useDOMRef';
import {useLocale} from 'react-aria/I18nProvider';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useScale} from './utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface ListViewProps<T>
  extends
    Omit<
      GridListProps<T>,
      | 'className'
      | 'style'
      | 'children'
      | 'selectionBehavior'
      | 'layout'
      | 'render'
      | 'orientation'
      | keyof GlobalDOMAttributes
    >,
    DOMProps,
    UnsafeStyles,
    ListViewStylesProps,
    SlotProps {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight;
  /** The current loading state of the ListView. */
  loadingState?: LoadingState;
  /** Handler that is called when more items should be loaded, e.g. while scrolling near the bottom. */
  onLoadMore?: () => void;
  /** The children of the ListView. */
  children: ReactNode | ((item: T) => ReactNode);
  /** Provides the ActionBar to display when items are selected in the ListView. */
  renderActionBar?: (selectedKeys: 'all' | Set<Key>) => ReactElement;
  /** Hides the default link out icons on items that open links in a new tab. */
  hideLinkOutIcon?: boolean;
}

interface ListViewStylesProps {
  /** Whether the ListView should be displayed with a quiet style. */
  isQuiet?: boolean;
  /**
   * How selection should be displayed.
   *
   * @default 'checkbox'
   */
  selectionStyle?: 'highlight' | 'checkbox';
  /**
   * Sets the overflow behavior for item contents.
   *
   * @default 'truncate'
   */
  overflowMode?: 'wrap' | 'truncate';
}

export interface ListViewItemProps extends Omit<
  GridListItemProps,
  'children' | 'className' | 'style' | 'render' | 'onClick' | keyof GlobalDOMAttributes
> {
  /**
   * The contents of the item.
   */
  children: ReactNode;
  /** Whether the item has child items (renders a chevron indicator). */
  hasChildItems?: boolean;
}

export const ListViewContext =
  createContext<ContextValue<Partial<ListViewProps<any>>, DOMRefValue<HTMLDivElement>>>(null);

let InternalListViewContext = createContext<{
  isQuiet?: boolean;
  selectionStyle?: 'highlight' | 'checkbox';
  overflowMode?: 'wrap' | 'truncate';
  scale?: 'medium' | 'large';
  hideLinkOutIcon?: boolean;
}>({});

const listViewWrapper = style(
  {
    minHeight: 0,
    minWidth: 200,
    display: 'flex',
    isolation: 'isolate',
    disableTapHighlight: true,
    position: 'relative',
    // Clip ActionBar animation.
    overflow: 'clip',
    '--root-drop-radius': {
      type: 'borderTopStartRadius',
      value: 'default'
    }
  },
  getAllowedOverrides({height: true})
);

// similar to tableview, use this approach so we can actually have a 2px outline when root dropping.
// cant do a external box shadow due to the clipping that is applied on the wrapper element...
// an inset box shadow runs into problems with the item background clipping the box shadow...
const rootDropOutline = css(`
  &:has([role="grid"][data-drop-target])::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    border: 2px solid ${color('blue-800')};
    border-radius: var(--root-drop-radius);
    z-index: 2;
  }
  @media (forced-colors: active) {
    &:has([role="grid"][data-drop-target])::after {
      border-color: Highlight;
    }
  }
`);

// When any row has a trailing icon, reserve space so actions align.
const hasTrailingIconRows = ':has([data-has-trailing-icon]) [role="row"]';

const dropTargetBackground = colorMix('gray-25', 'blue-900', 10);
const listView = style<GridListRenderProps & {isQuiet?: boolean; isDropTarget?: boolean}>({
  ...focusRing(),
  outlineOffset: {
    default: -2,
    isQuiet: -1
  },
  userSelect: 'none',
  minHeight: 0,
  minWidth: 0,
  width: 'full',
  height: 'full',
  boxSizing: 'border-box',
  overflow: 'auto',
  fontSize: controlFont(),
  backgroundColor: {
    default: 'gray-25',
    isQuiet: 'transparent',
    isDropTarget: {
      default: dropTargetBackground,
      forcedColors: 'Background'
    }
  },
  borderRadius: {
    default: 'default',
    isQuiet: 'none'
  },
  borderColor: {
    default: 'gray-300',
    forcedColors: 'ButtonBorder'
  },
  borderWidth: {
    default: 1,
    isQuiet: 0
  },
  borderStyle: 'solid',
  forcedColorAdjust: 'none',
  '--trailing-icon-width': {
    type: 'width',
    value: {
      default: 'auto',
      [hasTrailingIconRows]: fontRelative(20)
    }
  }
});

export class S2ListLayout<T> extends ListLayout<T> {
  getDropTargetLayoutInfo(target: ItemDropTarget): LayoutInfo {
    let layoutInfo = super.getDropTargetLayoutInfo(target);
    layoutInfo.zIndex = 1;
    layoutInfo.allowOverflow = true;
    return layoutInfo;
  }
}

/**
 * A ListView displays a list of interactive items, and allows a user to navigate, select, or
 * perform an action.
 */
export const ListView = /*#__PURE__*/ (forwardRef as forwardRefType)(function ListView<T>(
  props: ListViewProps<T>,
  ref: DOMRef<HTMLDivElement>
) {
  [props, ref] = useSpectrumContextProps(props, ref, ListViewContext);
  let {
    children,
    isQuiet,
    selectionStyle = 'checkbox',
    overflowMode = 'truncate',
    loadingState,
    onLoadMore,
    renderEmptyState: userRenderEmptyState,
    hideLinkOutIcon = false,
    dragAndDropHooks,
    ...otherProps
  } = props;
  let scale = useScale();

  if (dragAndDropHooks && dragAndDropHooks.renderDragPreview == null) {
    dragAndDropHooks.renderDragPreview = items => (
      <DragPreview items={items} overflowMode={overflowMode} />
    );
  }

  if (dragAndDropHooks) {
    dragAndDropHooks.renderDropIndicator = target => (
      <InsertionIndicator target={target as ItemDropTarget} />
    );
  }

  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  let rowHeight = scale === 'large' ? 50 : 40;

  let domRef = useDOMRef(ref);
  let scrollRef = useRef<HTMLElement | null>(null);

  let isLoading = loadingState === 'loading' || loadingState === 'loadingMore';
  let renderEmptyState: ListViewProps<T>['renderEmptyState'] | undefined;
  if (userRenderEmptyState != null && !isLoading) {
    renderEmptyState = renderProps => (
      <div className={emptyStateWrapper}>
        <CollectionRendererContext.Provider value={DefaultCollectionRenderer}>
          {userRenderEmptyState!(renderProps)}
        </CollectionRendererContext.Provider>
      </div>
    );
  } else if (loadingState === 'loading') {
    renderEmptyState = () => (
      <div className={centeredWrapper}>
        <div className={loadingSpinnerWrapper}>
          <ProgressCircle isIndeterminate aria-label={stringFormatter.format('table.loading')} />
        </div>
      </div>
    );
  }

  let loadMoreSpinner = onLoadMore ? (
    <GridListLoadMoreItem
      isLoading={loadingState === 'loadingMore'}
      onLoadMore={onLoadMore}
      className={style({height: 'full', width: 'full', paddingY: 8})}>
      <div className={centeredWrapper}>
        <div className={loadingSpinnerWrapper}>
          <ProgressCircle
            isIndeterminate
            aria-label={stringFormatter.format('table.loadingMore')}
          />
        </div>
      </div>
    </GridListLoadMoreItem>
  ) : null;

  let wrappedChildren: ReactNode;
  let gridListProps = otherProps;
  if (typeof children === 'function' && otherProps.items) {
    let {items, dependencies = [], ...rest} = otherProps;
    gridListProps = rest;
    wrappedChildren = (
      <>
        <Collection items={items} dependencies={dependencies}>
          {children}
        </Collection>
        {loadMoreSpinner}
      </>
    );
  } else {
    wrappedChildren = (
      <>
        {children}
        {loadMoreSpinner}
      </>
    );
  }

  let {selectedKeys, onSelectionChange, actionBar, actionBarHeight} = useActionBarContainer({
    ...props,
    scrollRef
  });

  return (
    <div
      ref={domRef}
      className={
        (props.UNSAFE_className || '') + listViewWrapper(null, props.styles) + ' ' + rootDropOutline
      }
      style={props.UNSAFE_style}>
      <Virtualizer
        layout={S2ListLayout}
        layoutOptions={{
          estimatedRowHeight: rowHeight,
          loaderHeight: 60,
          dropIndicatorThickness: 0
        }}>
        <InternalListViewContext.Provider
          value={{isQuiet, selectionStyle, overflowMode, scale, hideLinkOutIcon}}>
          <GridList
            ref={scrollRef as any}
            {...gridListProps}
            dragAndDropHooks={dragAndDropHooks}
            selectionBehavior={selectionStyle === 'highlight' ? 'replace' : 'toggle'}
            selectionMode={gridListProps.selectionMode}
            renderEmptyState={renderEmptyState}
            style={{
              paddingBottom: actionBarHeight > 0 ? actionBarHeight + 8 : 0,
              scrollPaddingBottom: actionBarHeight > 0 ? actionBarHeight + 8 : 0
            }}
            className={renderProps =>
              listView({
                ...renderProps,
                isQuiet,
                isDropTarget: renderProps.isDropTarget
              })
            }
            selectedKeys={selectedKeys}
            defaultSelectedKeys={undefined}
            onSelectionChange={onSelectionChange}>
            {wrappedChildren}
          </GridList>
        </InternalListViewContext.Provider>
      </Virtualizer>
      {actionBar}
    </div>
  );
});

const selectedBackground = colorMix('gray-25', 'gray-900', 7);
const selectedActiveBackground = colorMix('gray-25', 'gray-900', 10);

// TODO: removed the background color in HCM for highlight selection since it made it hard to see the focus
// ring of the drag button, this matches v3 anyways. thoughts?
const listitem = style<
  GridListItemRenderProps & {
    isFocused: boolean;
    isLink?: boolean;
    isQuiet?: boolean;
    isFirstItem?: boolean;
    isLastItem?: boolean;
    isSelected?: boolean;
    isDisabled?: boolean;
    isNextSelected?: boolean;
    isPrevSelected?: boolean;
    isPrevNotSelected?: boolean;
    isNextNotSelected?: boolean;
    selectionStyle?: 'highlight' | 'checkbox';
    scale?: 'medium' | 'large';
    isDropTarget?: boolean;
  }
>({
  outlineStyle: {
    default: 'none'
  },
  boxSizing: 'border-box',
  columnGap: 0,
  paddingX: 0,
  paddingY: 8,
  backgroundColor: 'transparent',
  color: {
    default: baseColor('neutral-subdued'),
    isSelected: baseColor('neutral'),
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonText',
      isSelected: {
        selectionStyle: {
          highlight: 'HighlightText'
        }
      },
      isDisabled: 'GrayText'
    }
  },
  position: 'relative',
  gridColumnStart: 1,
  gridColumnEnd: -1,
  display: 'grid',
  gridTemplateAreas: [
    '. dragbutton . checkmark icon label       actions actionmenu trailing-icon .',
    '. .          . .         .    description actions actionmenu trailing-icon .'
  ],
  gridTemplateColumns: [
    4,
    'auto',
    8,
    'auto',
    'auto',
    'minmax(0, 1fr)',
    'auto',
    'auto',
    'var(--trailing-icon-width)',
    6
  ],
  gridTemplateRows: '1fr auto',
  rowGap: {
    ':has([slot=description])': space(1)
  },
  alignItems: 'baseline',
  minHeight: {
    default: 40,
    scale: {
      large: 50
    }
  },
  textDecoration: 'none',
  cursor: {
    default: 'default',
    isLink: 'pointer'
  },
  '--borderColor': {
    type: 'borderColor',
    value: {
      default: 'gray-300',
      forcedColors: 'ButtonBorder',
      isSelected: {
        selectionStyle: {
          highlight: {
            default: 'blue-900',
            forcedColors: 'Highlight'
          },
          checkbox: 'gray-300'
        }
      }
    }
  },
  borderTopWidth: 0,
  borderBottomWidth: {
    default: 1,
    isLastItem: {
      default: 1,
      isQuiet: 0
    }
  },
  borderStartWidth: 0,
  borderEndWidth: 0,
  borderStyle: 'solid',
  borderColor: {
    default: '--borderColor',
    isNextSelected: 'transparent',
    isSelected: 'transparent',
    forcedColors: 'ButtonBorder'
  },
  '--radius': {
    type: 'borderTopStartRadius',
    value: 'default'
  },
  forcedColorAdjust: 'none'
});

const insetBorderRadius = 'calc(var(--radius) - 1px)';
const rootDropSelectedRowBackground = colorMix('gray-25', 'blue-900', 28);
const rowDropBackground = colorMix('gray-25', 'blue-900', 10);
const rootRowDropStyles = {
  // Unlike v3 tableview, v3 listview has the same background color for the listview itself and the rows when
  // dropping on root
  default: dropTargetBackground,
  isSelected: rootDropSelectedRowBackground,
  forcedColors: 'Background'
} as const;
const rowDropStyles = {
  // Also unlike v3, dropping on a selected row vs a non selected row doesn't have any difference in background color
  default: rowDropBackground,
  isSelected: rowDropBackground,
  forcedColors: 'Background'
} as const;

const listRowBackground = style<
  GridListItemRenderProps & {
    isFirstItem?: boolean;
    isLastItem?: boolean;
    isQuiet?: boolean;
    isPrevSelected?: boolean;
    isNextSelected?: boolean;
    isPrevNotSelected?: boolean;
    isNextNotSelected?: boolean;
    selectionStyle?: 'highlight' | 'checkbox';
    isDropTarget?: boolean;
  }
>({
  position: 'absolute',
  zIndex: -1,
  top: {
    default: 0,
    isSelected: '[-1px]',
    // Don't overlap focus ring of row above.
    isPrevSelected: 0,
    isFirstItem: 0,
    forcedColors: 0
  },
  left: 0,
  right: 0,
  bottom: {
    default: 0,
    isSelected: '[-1px]'
  },
  backgroundColor: {
    default: '--rowBackgroundColor',
    isHovered: {
      default: 'gray-900/5',
      selectionStyle: {
        checkbox: selectedBackground
      }
    },
    isPressed: {
      default: 'gray-900/10',
      selectionStyle: {
        checkbox: selectedActiveBackground
      }
    },
    isSelected: {
      selectionStyle: {
        checkbox: {
          default: selectedBackground,
          isHovered: selectedActiveBackground,
          isPressed: selectedActiveBackground,
          isFocusVisible: selectedActiveBackground
        },
        highlight: {
          // Use solid colors rather than transparent because the rows overlap.
          default: colorMix('gray-25', 'blue-900', 10),
          isHovered: colorMix('gray-25', 'blue-900', 15),
          isPressed: colorMix('gray-25', 'blue-900', 15)
        }
      }
    },
    forcedColors: {
      default: 'transparent',
      selectionStyle: {
        highlight: {
          isSelected: 'Highlight'
        }
      }
    },
    ':is([role="grid"][data-drop-target] *)': rootRowDropStyles,
    isDropTarget: rowDropStyles
  },
  borderTopStartRadius: {
    isQuiet: 'default',
    isSelected: 'none',
    isPrevNotSelected: {
      isSelected: {
        selectionStyle: {
          checkbox: 'none',
          highlight: insetBorderRadius
        }
      },
      isQuiet: 'default'
    },
    isDropTarget: insetBorderRadius
  },
  borderTopEndRadius: {
    isQuiet: 'default',
    isSelected: 'none',
    isPrevNotSelected: {
      isSelected: {
        selectionStyle: {
          checkbox: 'none',
          highlight: insetBorderRadius
        }
      },
      isQuiet: 'default'
    },
    isDropTarget: insetBorderRadius
  },
  borderBottomStartRadius: {
    isQuiet: 'default',
    isSelected: 'none',
    isNextNotSelected: {
      isSelected: {
        selectionStyle: {
          checkbox: 'none',
          highlight: insetBorderRadius
        }
      },
      isQuiet: 'default'
    },
    isDropTarget: insetBorderRadius
  },
  borderBottomEndRadius: {
    isQuiet: 'default',
    isSelected: 'none',
    isNextNotSelected: {
      isSelected: {
        selectionStyle: {
          checkbox: 'none',
          highlight: insetBorderRadius
        }
      },
      isQuiet: 'default'
    },
    isDropTarget: insetBorderRadius
  },
  borderTopWidth: {
    default: {
      selectionStyle: {
        checkbox: 0,
        highlight: 1
      }
    },
    isPrevSelected: 0,
    isDropTarget: 2
  },
  borderBottomWidth: {
    default: {
      selectionStyle: {
        checkbox: 0,
        highlight: 1
      }
    },
    isNextSelected: 0,
    isDropTarget: 2
  },
  borderStartWidth: {
    default: {
      selectionStyle: {
        checkbox: 0,
        highlight: 1
      }
    },
    isDropTarget: 2
  },
  borderEndWidth: {
    default: {
      selectionStyle: {
        checkbox: 0,
        highlight: 1
      }
    },
    isDropTarget: 2
  },
  borderStyle: 'solid',
  borderColor: {
    default: 'transparent',
    isSelected: {
      selectionStyle: {
        checkbox: 'transparent',
        highlight: '--borderColor'
      }
    },
    isDropTarget: 'blue-800',
    forcedColors: {
      isDropTarget: 'Highlight'
    }
  }
});

let listRowFocusRing = style<
  GridListItemRenderProps & {
    selectionStyle?: 'highlight' | 'checkbox';
    isFirstItem?: boolean;
    isPrevSelected?: boolean;
    isPrevNotSelected?: boolean;
    isNextSelected?: boolean;
    isNextNotSelected?: boolean;
    isLastItem?: boolean;
    isQuiet?: boolean;
  }
>({
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
    forcedColors: {
      default: 'Highlight',
      selectionStyle: {
        highlight: 'ButtonBorder'
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
      checkbox: {
        default: '[-1px]',
        // Avoid the next row's selected background covering this row's focus ring.
        isNextSelected: 0
      },
      highlight: '[-1px]'
    }
  },
  borderRadius: {
    default: insetBorderRadius,
    isQuiet: 'default'
  },
  zIndex: 1,
  pointerEvents: 'none'
});

let rowWrapper = style({
  display: 'contents'
});

let image = style({
  gridArea: 'icon',
  gridRowEnd: 'span 2',
  marginEnd: 'text-to-visual',
  alignSelf: 'center',
  borderRadius: 'sm',
  width: 32,
  aspectRatio: 'square',
  objectFit: 'cover'
});

let actionButtonGroup = style({
  gridArea: 'actions',
  gridRowEnd: 'span 2',
  alignSelf: 'center',
  justifySelf: 'end',
  marginStart: 'text-to-visual'
});

let listActionMenu = style({
  gridArea: 'actionmenu',
  gridRowEnd: 'span 2',
  alignSelf: 'center'
});

const listCheckbox = style({
  gridArea: 'checkmark',
  gridRowEnd: 'span 2',
  alignSelf: 'center',
  marginEnd: 8,
  visibility: {
    default: 'visible',
    isDisabled: 'hidden'
  }
});

const listTrailingIcon = style({
  gridArea: 'trailing-icon',
  gridRowEnd: 'span 2',
  alignSelf: 'center',
  display: 'flex',
  alignItems: 'center',
  marginStart: 'text-to-visual'
});

let dragButtonContainer = style({
  gridArea: 'dragbutton',
  gridRowEnd: 'span 2',
  alignSelf: 'center',
  display: 'flex',
  alignItems: 'center',
  width: 10
});

const centeredWrapper = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'full',
  height: 'full'
});

const loadingSpinnerWrapper = style({
  padding: space(4)
});

const emptyStateWrapper = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'full',
  height: 'full',
  boxSizing: 'border-box',
  padding: 16
});

function ListSelectionCheckbox({isDisabled}: {isDisabled: boolean}) {
  let selectionContext = useSlottedContext(CheckboxContext, 'selection');
  let isSelectionDisabled = isDisabled || !!selectionContext?.isDisabled;
  return (
    <div className={listCheckbox({isDisabled: isSelectionDisabled})}>
      <Checkbox slot="selection" />
    </div>
  );
}

export function ListViewItem(props: ListViewItemProps): ReactNode {
  let ref = useRef(null);
  let {hasChildItems, ...otherProps} = props;
  let isLink = props.href != null;
  let isLinkOut = isLink && props.target === '_blank';
  let {
    isQuiet,
    selectionStyle,
    overflowMode,
    scale,
    hideLinkOutIcon = false
  } = useContext(InternalListViewContext);
  let textValue =
    props.textValue || (typeof props.children === 'string' ? props.children : undefined);
  let {direction} = useLocale();
  let hasTrailingIcon = hasChildItems || (isLinkOut && !hideLinkOutIcon);

  return (
    <GridListItem
      {...otherProps}
      textValue={textValue}
      ref={ref}
      {...(hasTrailingIcon ? {'data-has-trailing-icon': ''} : {})}
      className={renderProps =>
        listitem({
          ...renderProps,
          isLink,
          isQuiet,
          scale,
          selectionStyle,
          isPrevNotSelected: !isPrevSelected(renderProps.id, renderProps.state),
          isNextSelected: isNextSelected(renderProps.id, renderProps.state),
          isNextNotSelected: !isNextSelected(renderProps.id, renderProps.state),
          isFirstItem: isFirstItem(renderProps.id, renderProps.state),
          isLastItem: isLastItem(renderProps.id, renderProps.state)
        })
      }>
      {renderProps => {
        let {children} = props;
        let {
          selectionMode,
          selectionBehavior,
          isDisabled,
          id,
          state,
          allowsDragging,
          isFocusVisibleWithin
        } = renderProps;
        return (
          <Provider
            values={[
              [
                TextContext,
                {
                  slots: {
                    [DEFAULT_SLOT]: {styles: label({...renderProps, overflowMode})},
                    label: {styles: label({...renderProps, overflowMode})},
                    description: {styles: description({...renderProps, overflowMode})}
                  }
                }
              ],
              [
                IconContext,
                {
                  slots: {
                    icon: {
                      render: centerBaseline({slot: 'icon', styles: iconCenterWrapper}),
                      styles: icon
                    }
                  }
                }
              ],
              [ImageContext, {styles: image}],
              [
                ActionButtonGroupContext,
                {
                  styles: actionButtonGroup,
                  size: 'S',
                  isQuiet: true
                }
              ],
              [
                ActionMenuContext,
                {
                  styles: listActionMenu,
                  isQuiet: true,
                  size: 'S',
                  isDisabled
                }
              ]
            ]}>
            <div className={rowWrapper}>
              <div
                className={listRowBackground({
                  ...renderProps,
                  selectionStyle,
                  isQuiet,
                  isDropTarget: renderProps.isDropTarget,
                  isPrevSelected: isPrevSelected(id, state),
                  isNextSelected: isNextSelected(id, state),
                  isPrevNotSelected: !isPrevSelected(id, state),
                  isNextNotSelected: !isNextSelected(id, state),
                  isFirstItem: isFirstItem(id, state),
                  isLastItem: isLastItem(id, state)
                })}
              />
              {renderProps.isFocusVisible && (
                <div
                  className={listRowFocusRing({
                    ...renderProps,
                    selectionStyle,
                    isQuiet,
                    isPrevSelected: isPrevSelected(id, state),
                    isNextSelected: isNextSelected(id, state),
                    isPrevNotSelected: !isPrevSelected(id, state),
                    isNextNotSelected: !isNextSelected(id, state),
                    isFirstItem: isFirstItem(id, state),
                    isLastItem: isLastItem(id, state)
                  })}
                />
              )}
              {allowsDragging && (
                <div className={dragButtonContainer}>
                  {!isDisabled && <DragHandleButton isFocusVisibleWithin={isFocusVisibleWithin} />}
                </div>
              )}
              {selectionMode !== 'none' && selectionBehavior === 'toggle' && (
                <ListSelectionCheckbox isDisabled={isDisabled} />
              )}
              {typeof children === 'string' ? <Text slot="label">{children}</Text> : children}
              {isLinkOut && !hideLinkOutIcon && (
                <div className={listTrailingIcon}>
                  <LinkOutIcon
                    size="M"
                    className={style({
                      scaleX: {
                        direction: {
                          rtl: -1
                        }
                      },
                      '--iconPrimary': {
                        type: 'fill',
                        value: 'currentColor'
                      }
                    })({direction})}
                  />
                </div>
              )}
              {hasChildItems && !isLinkOut && (
                <div className={listTrailingIcon}>
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
                    })({direction})}
                  />
                </div>
              )}
            </div>
          </Provider>
        );
      }}
    </GridListItem>
  );
}

function isNextSelected(id: Key | undefined, state: ListState<unknown>) {
  if (id == null || !state) {
    return false;
  }
  let keyAfter = state.collection.getKeyAfter(id);
  return keyAfter != null && state.selectionManager.isSelected(keyAfter);
}

function isPrevSelected(id: Key | undefined, state: ListState<unknown>) {
  if (id == null || !state) {
    return false;
  }
  let keyBefore = state.collection.getKeyBefore(id);
  return keyBefore != null && state.selectionManager.isSelected(keyBefore);
}

function isFirstItem(id: Key | undefined, state: ListState<unknown>) {
  if (id == null || !state) {
    return false;
  }
  return state.collection.getFirstKey() === id;
}

function isLastItem(id: Key | undefined, state: ListState<unknown>) {
  if (id == null || !state) {
    return false;
  }

  let key = state.collection.getLastKey();
  let node = key ? state.collection.getItem(key) : null;

  return node ? node.key === id : false;
}
