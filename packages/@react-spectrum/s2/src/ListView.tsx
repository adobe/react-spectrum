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
import {baseColor, colorMix, focusRing, fontRelative, space, style} from '../style' with {type: 'macro'};
import {centerBaseline} from './CenterBaseline';
import {Checkbox} from './Checkbox';
import Chevron from '../ui-icons/Chevron';
import {
  Collection,
  CollectionRendererContext,
  ContextValue,
  DEFAULT_SLOT,
  DefaultCollectionRenderer,
  GridList,
  GridListItem,
  GridListItemProps,
  GridListItemRenderProps,
  GridListLoadMoreItem,
  GridListLoadMoreItemProps,
  GridListProps,
  GridListRenderProps,
  ListLayout,
  Provider,
  SlotProps,
  Virtualizer
} from 'react-aria-components';
import {controlFont, getAllowedOverrides, StyleProps, StylesPropWithHeight, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {createContext, forwardRef, JSXElementConstructor, ReactElement, ReactNode, useContext, useRef} from 'react';
import {DOMProps, DOMRef, DOMRefValue, forwardRefType, GlobalDOMAttributes, LoadingState} from '@react-types/shared';
import {edgeToText} from '../style/spectrum-theme' with {type: 'macro'};
import {IconContext} from './Icon';
import {ImageContext} from './Image';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {pressScale} from './pressScale';
import {ProgressCircle} from './ProgressCircle';
import {Text, TextContext} from './Content';
import {useDOMRef} from '@react-spectrum/utils';
import {useLocale, useLocalizedStringFormatter} from 'react-aria';
import {useScale} from './utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface ListViewProps<T> extends Omit<GridListProps<T>, 'className' | 'style' | 'children' | 'selectionBehavior' | keyof GlobalDOMAttributes>, DOMProps, UnsafeStyles, ListViewStylesProps, SlotProps {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight,
  /**
   * Whether to automatically focus the ListView when it first renders.
   */
  autoFocus?: boolean,
  /** The current loading state of the ListView. */
  loadingState?: LoadingState,
  /** Handler that is called when more items should be loaded, e.g. while scrolling near the bottom. */
  onLoadMore?: () => void,
  /** The children of the ListView. */
  children: ReactNode | ((item: T) => ReactNode)
}

interface ListViewStylesProps {
  /** Whether the ListView should be displayed with a quiet style. */
  isQuiet?: boolean,
  /**
   * How selection should be displayed.
   * @default 'checkbox'
   */
  selectionStyle?: 'highlight' | 'checkbox',
  /**
   * Sets the overflow behavior for item contents.
   * @default 'truncate'
   */
  overflowMode?: 'wrap' | 'truncate',
  highlightMode?: 'normal' | 'inverse'
}

export interface ListViewItemProps extends Omit<GridListItemProps, 'children' | 'style' | 'className'>, StyleProps {
  /**
   * The contents of the item.
   */
  children: ReactNode,
  /** Whether the item has child items (renders a chevron indicator). */
  hasChildItems?: boolean
}

export interface ListViewLoadMoreItemProps extends Pick<GridListLoadMoreItemProps, 'onLoadMore'> {
  /** The current loading state of the ListView. */
  loadingState?: LoadingState
}

interface ListViewRendererContextValue {
  renderer?: (item) => ReactElement<any, string | JSXElementConstructor<any>>
}
const ListViewRendererContext = createContext<ListViewRendererContextValue>({});

export const ListViewContext = createContext<ContextValue<Partial<ListViewProps<any>>, DOMRefValue<HTMLDivElement>>>(null);

let InternalListViewContext = createContext<{isQuiet?: boolean, selectionStyle?: 'highlight' | 'checkbox', overflowMode?: 'wrap' | 'truncate', scale?: 'medium' | 'large'}>({});

const listView = style<GridListRenderProps & {isQuiet?: boolean}>({
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
    forcedColors: 'Background'
  },
  borderRadius: {
    default: 'default',
    isQuiet: 'none'
  },
  borderColor: 'gray-300',
  borderWidth: {
    default: 1,
    isQuiet: 0
  },
  borderStyle: 'solid'
}, getAllowedOverrides({height: true}));

/**
 * A ListView displays a list of interactive items, and allows a user to navigate, select, or perform an action.
 */
export const ListView = /*#__PURE__*/ (forwardRef as forwardRefType)(function ListView<T extends object>(
  props: ListViewProps<T>,
  ref: DOMRef<HTMLDivElement>
) {
  [props, ref] = useSpectrumContextProps(props, ref, ListViewContext);
  let {children, isQuiet, selectionStyle = 'checkbox', overflowMode = 'truncate', loadingState, onLoadMore, renderEmptyState: userRenderEmptyState, ...otherProps} = props;
  let scale = useScale();
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  let rowHeight = scale === 'large' ? 50 : 40;

  let renderer;
  if (typeof children === 'function') {
    renderer = children;
  }

  let domRef = useDOMRef(ref);

  let isLoading = loadingState === 'loading' || loadingState === 'loadingMore';
  let renderEmptyState: ListViewProps<T>['renderEmptyState'] | undefined;
  if (userRenderEmptyState != null && !isLoading) {
    renderEmptyState = (renderProps) => (
      <div className={emptyStateWrapper}>
        <CollectionRendererContext.Provider value={DefaultCollectionRenderer}>
          {userRenderEmptyState!(renderProps)}
        </CollectionRendererContext.Provider>
      </div>
    );
  } else if (loadingState === 'loading') {
    renderEmptyState = () => (
      <div className={centeredWrapper}>
        <ProgressCircle
          isIndeterminate
          aria-label={stringFormatter.format('table.loading')} />
      </div>
    );
  }

  let loadMoreSpinner = onLoadMore ? (
    <GridListLoadMoreItem isLoading={loadingState === 'loadingMore'} onLoadMore={onLoadMore} className={style({height: 'full', width: 'full', paddingY: 8})}>
      <div className={centeredWrapper}>
        <ProgressCircle
          isIndeterminate
          aria-label={stringFormatter.format('table.loadingMore')} />
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

  return (
    <Virtualizer
      layout={ListLayout}
      layoutOptions={{
        estimatedRowHeight: rowHeight,
        loaderHeight: 60
      }}>
      <ListViewRendererContext.Provider value={{renderer}}>
        <InternalListViewContext.Provider value={{isQuiet, selectionStyle, overflowMode, scale}}>
          <GridList
            ref={domRef}
            {...gridListProps}
            selectionBehavior={selectionStyle === 'highlight' ? 'replace' : 'toggle'}
            renderEmptyState={renderEmptyState}
            style={props.UNSAFE_style}
            className={(renderProps) => (props.UNSAFE_className || '') + listView({
              ...renderProps,
              isQuiet
            }, props.styles)}>
            {wrappedChildren}
          </GridList>
        </InternalListViewContext.Provider>
      </ListViewRendererContext.Provider>
    </Virtualizer>
  );
});

const listitem = style<GridListItemRenderProps & {
  isFocused: boolean,
  isLink?: boolean,
  isQuiet?: boolean,
  isFirstItem?: boolean,
  isLastItem?: boolean,
  isSelected?: boolean,
  isDisabled?: boolean,
  isNextSelected?: boolean,
  isPrevSelected?: boolean,
  isPrevNotSelected?: boolean,
  isNextNotSelected?: boolean,
  selectionStyle?: 'highlight' | 'checkbox',
  scale?: 'medium' | 'large'
}>({
  ...focusRing(),
  boxSizing: 'border-box',
  outlineOffset: -2,
  columnGap: 0,
  paddingX: 0,
  paddingY: 8,
  backgroundColor: 'transparent',
  color: {
    default: baseColor('neutral-subdued'),
    isSelected: baseColor('neutral'),
    isDisabled: {
      default: 'disabled',
      forcedColors: 'GrayText'
    }
  },
  position: 'relative',
  gridColumnStart: 1,
  gridColumnEnd: -1,
  display: 'grid',
  gridTemplateAreas: [
    '. checkmark icon label       actions actionmenu chevron .',
    '. .         .    description actions actionmenu chevron .'
  ],
  gridTemplateColumns: [edgeToText(40), 'auto', 'auto', 'minmax(0, 1fr)', 'auto', 'auto', 'auto', edgeToText(40)],
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
  transition: 'default',
  '--borderColor': {
    type: 'borderTopColor',
    value: {
      default: 'gray-300',
      isSelected: {
        selectionStyle: {
          highlight: 'blue-900',
          checkbox: 'gray-300'
        }
      },
      forcedColors: 'ButtonBorder'
    }
  },
  borderTopWidth: 0,
  borderBottomWidth: {
    default: 1,
    isSelected: {
      selectionStyle: {
        highlight: 0,
        checkbox: 1
      }
    }
  },
  borderStartWidth: 0,
  borderEndWidth: 0,
  borderStyle: 'solid',
  borderBottomColor: {
    default: '--borderColor',
    isSelected: {
      selectionStyle: {
        highlight: {
          default: '--borderColor',
          isNextSelected: 'transparent'
        },
        checkbox: '--borderColor'
      }
    }
  },
  borderTopStartRadius: {
    isFirstItem: 'default'
  },
  borderTopEndRadius: {
    isFirstItem: 'default'
  },
  borderBottomStartRadius: {
    isLastItem: 'default'
  },
  borderBottomEndRadius: {
    isLastItem: 'default'
  }
}, getAllowedOverrides());

const selectedBackground = colorMix('gray-25', 'gray-900', 7);
const selectedActiveBackground = colorMix('gray-25', 'gray-900', 10);

const listRowBackground = style<GridListItemRenderProps & {
  isFirstItem?: boolean,
  isLastItem?: boolean,
  isPrevSelected?: boolean,
  isNextSelected?: boolean,
  isPrevNotSelected?: boolean,
  isNextNotSelected?: boolean,
  selectionStyle?: 'highlight' | 'checkbox'
}>({
  position: 'absolute',
  zIndex: -1,
  inset: 0,
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
          default: 'blue-900/10',
          isHovered: 'blue-900/15',
          isPressed: 'blue-900/15'
        }
      }
    },
    forcedColors: {
      default: 'Background'
    }
  },
  borderTopStartRadius: {
    isFirstItem: 'default'
  },
  borderTopEndRadius: {
    isFirstItem: 'default'
  },
  borderBottomStartRadius: {
    isLastItem: 'default'
  },
  borderBottomEndRadius: {
    isLastItem: 'default'
  },
  borderTopWidth: {
    default: 1,
    isPrevSelected: {
      selectionStyle: {
        highlight: 0
      }
    }
  },
  borderBottomWidth: {
    default: 1,
    isNextSelected: {
      selectionStyle: {
        highlight: 0
      }
    }
  },
  borderStartWidth: 1,
  borderEndWidth: 1,
  borderStyle: 'solid',
  borderColor: {
    default: 'transparent',
    isSelected: {
      selectionStyle: {
        highlight: '--borderColor',
        checkbox: 'transparent'
      }
    }
  }
});

export let label = style({
  gridArea: 'label',
  alignSelf: 'center',
  font: controlFont(),
  color: 'inherit',
  truncate: true,
  whiteSpace: {
    default: 'nowrap',
    overflowMode: {
      wrap: 'normal'
    }
  }
});

export let description = style({
  gridArea: 'description',
  alignSelf: 'center',
  truncate: true,
  whiteSpace: {
    default: 'nowrap',
    overflowMode: {
      wrap: 'normal'
    }
  },
  font: 'ui-sm',
  color: {
    default: baseColor('neutral-subdued'),
    isDisabled: 'disabled'
  },
  transition: 'default'
});

export let iconCenterWrapper = style({
  display: 'flex',
  gridArea: 'icon',
  gridRowEnd: 'span 2',
  alignSelf: 'center',
  alignItems: 'center'
});

export let icon = style({
  display: 'block',
  size: fontRelative(20),
  // too small default icon size is wrong, it's like the icons are 1 tshirt size bigger than the rest of the component? check again after typography changes
  // reminder, size of WF is applied via font size
  marginEnd: 'text-to-visual',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
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
  marginEnd: 'text-to-visual',
  visibility: {
    default: 'visible',
    isDisabled: 'hidden'
  }
});

const listChevron = style({
  gridArea: 'chevron',
  gridRowEnd: 'span 2',
  alignSelf: 'center',
  display: 'flex',
  alignItems: 'center',
  marginStart: 'text-to-visual'
});

const centeredWrapper = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'full',
  height: 'full'
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

export function ListViewItem(props: ListViewItemProps): ReactNode {
  let ref = useRef(null);
  let {hasChildItems, ...otherProps} = props;
  let isLink = props.href != null;
  let {isQuiet, selectionStyle, overflowMode, scale} = useContext(InternalListViewContext);
  let textValue = props.textValue || (typeof props.children === 'string' ? props.children : undefined);
  let {direction} = useLocale();

  return (
    <GridListItem
      {...otherProps}
      textValue={textValue}
      ref={ref}
      style={pressScale(ref, props.UNSAFE_style)}
      className={renderProps => (props.UNSAFE_className || '') + listitem({
        ...renderProps,
        isLink,
        isQuiet,
        scale,
        selectionStyle,
        isPrevNotSelected: !renderProps.isPrevSelected,
        isNextNotSelected: !renderProps.isNextSelected
      }, props.styles)}>
      {(renderProps) => {
        let {children} = props;
        let {selectionMode, selectionBehavior, isDisabled} = renderProps;
        return (
          <Provider
            values={[
              [TextContext, {
                slots: {
                  [DEFAULT_SLOT]: {styles: label({...renderProps, overflowMode})},
                  label: {styles: label({...renderProps, overflowMode})},
                  description: {styles: description({...renderProps, overflowMode})}
                }
              }],
              [IconContext, {
                slots: {
                  icon: {render: centerBaseline({slot: 'icon', styles: iconCenterWrapper}), styles: icon}
                }
              }],
              [ImageContext, {styles: image}],
              [ActionButtonGroupContext, {
                styles: actionButtonGroup,
                size: 'S',
                isQuiet: true
              }],
              [ActionMenuContext, {
                styles: listActionMenu,
                isQuiet: true,
                size: 'S',
                isDisabled
              }]
            ]}>
            <div className={listRowBackground({...renderProps, selectionStyle, isPrevNotSelected: !renderProps.isPrevSelected, isNextNotSelected: !renderProps.isNextSelected})} />
            {selectionMode !== 'none' && selectionBehavior === 'toggle' && (
              <div className={listCheckbox({isDisabled})}>
                <Checkbox slot="selection" />
              </div>
            )}
            {typeof children === 'string' ? <Text slot="label">{children}</Text> : children}
            {hasChildItems && (
              <div className={listChevron}>
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
              </div>
            )}
          </Provider>
        );
      }}
    </GridListItem>
  );
}

export const ListViewLoadMoreItem = (props: ListViewLoadMoreItemProps): ReactNode => {
  let {loadingState, onLoadMore} = props;
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  let isLoading = loadingState === 'loading' || loadingState === 'loadingMore';
  return (
    <GridListLoadMoreItem isLoading={isLoading} onLoadMore={onLoadMore} className={style({height: 'full', width: 'full', paddingY: 8})}>
      <div className={centeredWrapper}>
        <ProgressCircle
          isIndeterminate
          aria-label={stringFormatter.format('table.loadingMore')} />
      </div>
    </GridListLoadMoreItem>
  );
};
