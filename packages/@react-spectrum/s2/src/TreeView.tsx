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
import {
  Button,
  ButtonContext,
  ContextValue,
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
  useContextProps,
  Virtualizer
} from 'react-aria-components';
import {centerBaseline} from './CenterBaseline';
import {Checkbox} from './Checkbox';
import Chevron from '../ui-icons/Chevron';
import {colorMix, focusRing, fontRelative, lightDark, style} from '../style' with {type: 'macro'};
import {DOMRef, DOMRefValue, forwardRefType, GlobalDOMAttributes, Key, LoadingState} from '@react-types/shared';
import {getAllowedOverrides, StylesPropWithHeight, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {IconContext} from './Icon';
import {ImageContext} from './Image';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ProgressCircle} from './ProgressCircle';
import React, {createContext, forwardRef, JSXElementConstructor, ReactElement, ReactNode, useContext, useRef} from 'react';
import {Text, TextContext} from './Content';
import {useDOMRef} from '@react-spectrum/utils';
import {useLocale, useLocalizedStringFormatter} from 'react-aria';
import {useScale} from './utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

interface S2TreeProps {
  // Only detatched is supported right now with the current styles from Spectrum
  // See https://github.com/adobe/react-spectrum/pull/7343 for what remaining combinations are left
  /** Whether the tree should be displayed with a [detached style](https://spectrum.adobe.com/page/tree-view/#Detached). */
  isDetached?: boolean,
  /** Handler that is called when a user performs an action on a row. */
  onAction?: (key: Key) => void,
  /** Whether the tree should be displayed with a [emphasized style](https://spectrum.adobe.com/page/tree-view/#Emphasis). */
  isEmphasized?: boolean,
  selectionStyle?: 'highlight' | 'checkbox',
  selectionCornerStyle?: 'square' | 'round'
}

export interface TreeViewProps<T> extends Omit<RACTreeProps<T>, 'style' | 'className' | 'onRowAction' | 'selectionBehavior' | 'onScroll' | 'onCellAction' | 'dragAndDropHooks' | keyof GlobalDOMAttributes>, UnsafeStyles, S2TreeProps {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight
}

export interface TreeViewItemProps extends Omit<RACTreeItemProps, 'className' | 'style' | 'onClick' | keyof GlobalDOMAttributes> {
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

export const TreeViewContext = createContext<ContextValue<Partial<TreeViewProps<any>>, DOMRefValue<HTMLDivElement>>>(null);


let InternalTreeContext = createContext<{isDetached?: boolean, isEmphasized?: boolean, selectionStyle: 'highlight' | 'checkbox', selectionCornerStyle: 'square' | 'round'}>({selectionStyle: 'checkbox', selectionCornerStyle: 'round'});

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
  padding: 4,
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
}, getAllowedOverrides({height: true}));

/**
 * A tree view provides users with a way to navigate nested hierarchical information.
 */
export const TreeView = /*#__PURE__*/ (forwardRef as forwardRefType)(function TreeView<T extends object>(props: TreeViewProps<T>, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, TreeViewContext);
  let {children, isDetached, isEmphasized, selectionStyle = 'checkbox', selectionCornerStyle = 'round', UNSAFE_className, UNSAFE_style} = props;
  let scale = useScale();

  let renderer;
  if (typeof children === 'function') {
    renderer = children;
  }

  let domRef = useDOMRef(ref);

  return (
    <Virtualizer
      layout={ListLayout}
      layoutOptions={{
        rowHeight: scale === 'large' ? 50 : 40,
        gap: isDetached ? 2 : 0
      }}>
      <TreeRendererContext.Provider value={{renderer}}>
        <InternalTreeContext.Provider value={{isDetached, isEmphasized, selectionStyle, selectionCornerStyle}}>
          <Tree
            {...props}
            style={UNSAFE_style}
            className={renderProps => (UNSAFE_className ?? '') + tree({isDetached, ...renderProps}, props.styles)}
            selectionBehavior={selectionStyle === 'highlight' ? 'replace' : 'toggle'}
            ref={domRef}>
            {props.children}
          </Tree>
        </InternalTreeContext.Provider>
      </TreeRendererContext.Provider>
    </Virtualizer>
  );
});

const selectedBackground = lightDark(colorMix('gray-25', 'informative-900', 10), colorMix('gray-25', 'informative-700', 10));
const selectedActiveBackground = lightDark(colorMix('gray-25', 'informative-900', 15), colorMix('gray-25', 'informative-700', 15));

const rowBackgroundColor = {
  selectionStyle: {
    checkbox: {
      default: '--s2-container-bg',
      isFocusVisibleWithin: colorMix('gray-25', 'gray-900', 7),
      isHovered: colorMix('gray-25', 'gray-900', 7),
      isPressed: colorMix('gray-25', 'gray-900', 10),
      isSelected: {
        default: colorMix('gray-25', 'gray-900', 7),
        isEmphasized: selectedBackground,
        isFocusVisibleWithin: {
          default: colorMix('gray-25', 'gray-900', 10),
          isEmphasized: selectedActiveBackground
        },
        isHovered: {
          default: colorMix('gray-25', 'gray-900', 10),
          isEmphasized: selectedActiveBackground
        },
        isPressed: {
          default: colorMix('gray-25', 'gray-900', 10),
          isEmphasized: selectedActiveBackground
        }
      },
      forcedColors: {
        default: 'Background'
      }
    },
    highlight: {
      default: 'transparent'
    }
  }
} as const;

const treeRow = style({
  ...focusRing(),
  outlineOffset: 2,
  position: 'relative',
  display: 'flex',
  height: 40,
  width: 'calc(100% - 24px)',
  boxSizing: 'border-box',
  font: 'ui',
  color: 'body',
  cursor: {
    default: 'default',
    isLink: 'pointer'
  },
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
  '--borderRadiusTreeItem': {
    type: 'borderTopStartRadius',
    value: {
      default: 'sm',
      isRound: 'default'
    }
  },
  borderTopStartRadius: {
    default: '--borderRadiusTreeItem',
    isPreviousSelected: 'none',
    isDetached: 'default'
  },
  borderTopEndRadius: {
    default: '--borderRadiusTreeItem',
    isPreviousSelected: 'none',
    isDetached: 'default'
  },
  borderBottomStartRadius: {
    default: '--borderRadiusTreeItem',
    isNextSelected: 'none',
    isDetached: 'default'
  },
  borderBottomEndRadius: {
    default: '--borderRadiusTreeItem',
    isNextSelected: 'none',
    isDetached: 'default'
  }
});

const treeCellGrid = style({
  display: 'grid',
  width: 'full',
  height: 'full',
  alignContent: 'center',
  alignItems: 'center',
  boxSizing: 'border-box',
  gridTemplateColumns: ['auto', 'auto', 'auto', 'auto', 'auto', '1fr', 'minmax(0, auto)', 'auto'],
  gridTemplateRows: '1fr',
  gridTemplateAreas: [
    'drag-handle checkbox level-padding expand-button icon content actions actionmenu'
  ],
  paddingEnd: 4, // account for any focus rings on the last item in the cell
  color: {
    default: 'gray-700',
    isHovered: 'gray-800',
    isSelected: 'gray-900',
    isDisabled: {
      default: 'gray-400',
      forcedColors: 'GrayText'
    }
  },
  '--thumbnailBorderColor': {
    type: 'color',
    value: {
      default: 'gray-500',
      isHovered: 'gray-800',
      isSelected: 'gray-900',
      isEmphasized: {
        isSelected: 'blue-900'
      },
      isDisabled: {
        default: 'gray-400',
        forcedColors: 'GrayText'
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
    type: 'borderTopColor',
    value: {
      default: 'transparent',
      isSelected: 'blue-900',
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
    isHovered: 'gray-900/5',
    isPressed: 'gray-900/10',
    isSelected: {
      default: 'blue-900/10',
      isHovered: 'blue-900/15',
      isPressed: 'blue-900/15'
    },
    forcedColors: {
      default: 'Background'
    }
  },
  borderTopStartRadius: {
    default: '--borderRadiusTreeItem',
    isPreviousSelected: {
      default: '--borderRadiusTreeItem',
      isSelected: 'none'
    },
    isDetached: 'default'
  },
  borderTopEndRadius: {
    default: '--borderRadiusTreeItem',
    isPreviousSelected: {
      default: '--borderRadiusTreeItem',
      isSelected: 'none'
    },
    isDetached: 'default'
  },
  borderBottomStartRadius: {
    default: '--borderRadiusTreeItem',
    isNextSelected: {
      default: '--borderRadiusTreeItem',
      isSelected: 'none'
    },
    isDetached: 'default'
  },
  borderBottomEndRadius: {
    default: '--borderRadiusTreeItem',
    isNextSelected: {
      default: '--borderRadiusTreeItem',
      isSelected: 'none'
    },
    isDetached: 'default'
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
    isSelected: '--borderColor',
    isDetached: {
      default: 'transparent',
      isSelected: '--rowSelectedBorderColor'
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
  marginEnd: 'text-to-visual',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

const treeThumbnail = style({
  gridArea: 'icon',
  marginEnd: 'text-to-visual',
  width: 32,
  aspectRatio: 'square',
  objectFit: 'contain',
  borderRadius: 'sm',
  borderWidth: 1,
  borderColor: '--thumbnailBorderColor',
  borderStyle: 'solid',
  padding: 2,
  backgroundColor: 'white',
  boxSizing: 'border-box'
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

// const treeRowFocusIndicator = raw(`
//   &:before {
//     content: "";
//     display: block;
//     position: absolute;
//     inset-inline-start: -4px;
//     inset-block-start: -4px;
//     inset-block-end: -4px;
//     inset-inline-end: -4px;
//     border-radius: var(--borderRadiusTreeItem);
//     border-width: 2px;
//     border-style: solid;
//     border-color: var(--rowFocusIndicatorColor);
//     z-index: 3;
//     pointer-events: none;
//   }`
// );

export const TreeViewItem = (props: TreeViewItemProps): ReactNode => {
  let {
    href
  } = props;
  let {isEmphasized, selectionStyle, selectionCornerStyle} = useContext(InternalTreeContext);

  return (
    <TreeItem
      {...props}
      className={(renderProps) => treeRow({
        ...renderProps,
        isLink: !!href,
        isEmphasized,
        selectionStyle,
        isRound: selectionCornerStyle === 'round'
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
  let {isDetached, isEmphasized, selectionCornerStyle} = useContext(InternalTreeContext);
  let scale = useScale();

  return (
    <TreeItemContent>
      {({isExpanded, hasChildItems, selectionMode, selectionBehavior, isDisabled, isFocusVisible, isSelected, id, state, isHovered}) => {
        let isNextSelected = false;
        let isNextFocused = false;
        let isPreviousSelected = false;
        let keyBefore = state.collection.getKeyBefore(id);
        let keyAfter = state.collection.getKeyAfter(id);
        if (keyBefore != null) {
          isPreviousSelected = state.selectionManager.isSelected(keyBefore);
        }
        if (keyAfter != null) {
          isNextSelected = state.selectionManager.isSelected(keyAfter);
        }
        let isFirst = state.collection.getFirstKey() === id;
        let isRound = selectionCornerStyle === 'round';

        return (
          <div className={treeCellGrid({isDisabled, isPreviousSelected, isNextSelected, isSelected, isFirst, isNextFocused, isHovered, isDetached, isEmphasized, isRound})}>
            <div className={treeRowBackground({isPreviousSelected, isNextSelected, isSelected, isEmphasized, isHovered, isRound})} />
            {selectionMode !== 'none' && selectionBehavior === 'toggle' && (
              // TODO: add transition?
              <div className={treeCheckbox}>
                <Checkbox
                  isEmphasized={isEmphasized}
                  slot="selection" />
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
                [ImageContext, {styles: treeThumbnail}],
                [IconContext, {
                  render: centerBaseline({slot: 'icon', styles: treeIcon}),
                  styles: style({size: fontRelative(20), flexShrink: 0})
                }],
                [ActionButtonGroupContext, {styles: treeActions, size: 'S'}],
                [ActionMenuContext, {styles: treeActionMenu, isQuiet: true, size: 'S'}]
              ]}>
              {typeof children === 'string' ? <Text>{children}</Text> : children}
            </Provider>
            {isFocusVisible && isDetached && <div role="presentation" className={style({...cellFocus, position: 'absolute', inset: 0})({isFocusVisible: true})} />}
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
