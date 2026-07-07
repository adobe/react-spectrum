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

import {baseColor, focusRing, fontRelative, style} from '../style' with {type: 'macro'};
import {Button, ButtonContext} from 'react-aria-components/Button';
import {centerBaseline} from './CenterBaseline';
import Chevron from '../ui-icons/Chevron';
import {DOMRef, forwardRefType, GlobalDOMAttributes, Key} from '@react-types/shared';
import {
  getAllowedOverrides,
  StylesPropWithHeight,
  UnsafeStyles
} from './style-utils' with {type: 'macro'};
import {getEventTarget} from 'react-aria/private/utils/shadowdom/DOMFunctions';
import {
  GridListSectionProps,
  TreeItemProps as RACTreeItemProps,
  TreeProps as RACTreeProps,
  Tree,
  TreeHeader,
  TreeItem,
  TreeItemContent,
  TreeItemContentProps,
  TreeItemRenderProps,
  TreeRenderProps,
  TreeSection
} from 'react-aria-components/Tree';
import {IconContext} from './Icon';
import {Link, LinkProps} from 'react-aria-components/Link';
import {Provider, useContextProps} from 'react-aria-components/slots';
import React, {
  createContext,
  forwardRef,
  JSXElementConstructor,
  ReactElement,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  RefObject,
  useContext,
  useRef
} from 'react';
import {SelectionIndicator} from 'react-aria-components/SelectionIndicator';
import {Text, TextContext} from './Content';
import {TreeState} from 'react-stately/useTreeState';
import {useDOMRef} from './useDOMRef';
import {useLocale} from 'react-aria/I18nProvider';
import {useScale} from './utils';

export interface SideNavProps<T>
  extends
    Omit<
      RACTreeProps<T>,
      | 'style'
      | 'className'
      | 'render'
      | 'onRowAction'
      | 'selectionBehavior'
      | 'onScroll'
      | 'onCellAction'
      | keyof GlobalDOMAttributes
    >,
    UnsafeStyles,
    SideNavStyleProps {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight;
}

interface SideNavStyleProps {}

export interface SideNavItemProps extends Omit<
  RACTreeItemProps,
  'className' | 'style' | 'render' | 'onClick' | keyof GlobalDOMAttributes
> {
  /** Whether this item has children, even if not loaded yet. */
  hasChildItems?: boolean;
}

interface TreeRendererContextValue {
  renderer?: (item) => ReactElement<any, string | JSXElementConstructor<any>>;
}
const TreeRendererContext = createContext<TreeRendererContextValue>({});

const sideNavWrapper = style(
  {
    minHeight: 0,
    height: 'full',
    minWidth: 160,
    display: 'flex',
    isolation: 'isolate',
    disableTapHighlight: true,
    position: 'relative',
    overflow: 'clip',
    '--indicator-level-padding': {
      type: 'width',
      value: {
        // 4 (start gap) + 10 (drag handle) + (hasCheckbox ? 16 + 8 : 0) + 40 (expand button)
        // keep in sync with treeCellGrid gridTemplateColumns
        default: 54
      }
    }
  },
  getAllowedOverrides({height: true})
);

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
  '--indent': {
    type: 'width',
    value: 16
  }
});

interface InternalSideNavContextValue {
  /**
   * Ref to the tree state, bridged up from SideNavItemContent so arrow-key handling can toggle
   * expansion.
   */
  stateRef?: RefObject<TreeState<unknown> | null>;
}
let InternalSideNavContext = createContext<InternalSideNavContextValue>({});

/**
 * A tree view provides users with a way to navigate nested hierarchical information.
 */
export const SideNav = /*#__PURE__*/ (forwardRef as forwardRefType)(function SideNav<T>(
  props: SideNavProps<T>,
  ref: DOMRef<HTMLDivElement>
) {
  let {children, UNSAFE_className, UNSAFE_style} = props;

  let renderer;
  if (typeof children === 'function') {
    renderer = children;
  }

  let domRef = useDOMRef(ref);
  let scrollRef = useRef<HTMLDivElement | null>(null);
  let stateRef = useRef<TreeState<unknown> | null>(null);

  // RAC swallows arrow keys at the collection level (stopPropagation during capture), so a handler
  // on the link never sees them. Intercept here on an ancestor, before RAC's row handler runs, and
  // expand a collapsed row when the expand arrow is pressed while focus is on its link.
  let onKeyDownCapture = (e: ReactKeyboardEvent) => {
    let state = stateRef.current;
    if (!state) {
      return;
    }
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
      return;
    }
    let link = getEventTarget(e).closest?.('a');
    if (!link) {
      return;
    }
    let rowEl = link.closest<HTMLElement>('[role="row"]');
    // Only intercept to open a collapsed, expandable row; let RAC handle everything else
    // (e.g. an already-expanded row moves focus into its children).
    if (!rowEl || rowEl.getAttribute('aria-expanded') !== 'false') {
      return;
    }
    let key = rowEl.dataset.key;
    if (key == null) {
      return;
    }
    state.toggleKey(key);
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div
      ref={domRef}
      className={(UNSAFE_className ?? '') + sideNavWrapper(null, props.styles)}
      style={UNSAFE_style}
      onKeyDownCapture={onKeyDownCapture}>
      <TreeRendererContext.Provider value={{renderer}}>
        <InternalSideNavContext.Provider value={{stateRef}}>
          <Tree
            {...props}
            style={{
              paddingBottom: 0,
              scrollPaddingBottom: 0
            }}
            className={renderProps => tree(renderProps)}
            selectionBehavior="replace"
            selectionMode="single"
            keyboardNavigationBehavior="arrow"
            disallowEmptySelection
            ref={scrollRef}>
            {props.children}
          </Tree>
        </InternalSideNavContext.Provider>
      </TreeRendererContext.Provider>
    </div>
  );
});

const treeRow = style<TreeItemRenderProps & {isLink?: boolean; isPreviousSelected?: boolean}>({
  outlineStyle: 'none',
  position: 'relative',
  display: 'flex',
  height: 32,
  width: 'full',
  boxSizing: 'border-box',
  font: 'ui',
  color: {
    default: baseColor('neutral-subdued'),
    forcedColors: 'ButtonText'
  },
  cursor: {
    default: 'default',
    isLink: 'pointer'
  },
  '--borderRadiusTreeItem': {
    type: 'borderTopStartRadius',
    value: 'sm'
  },
  borderRadius: 'sm',
  marginTop: {
    ':not([aria-posinset="1"])': '[6px]',
    ':first-child': 0
  }
});

const treeCellGrid = style({
  display: 'grid',
  width: 'full',
  height: 'full',
  boxSizing: 'border-box',
  alignContent: 'center',
  alignItems: 'center',
  gridTemplateColumns: [12, 'auto', '1fr'],
  gridTemplateRows: '1fr',
  gridTemplateAreas: ['. level-padding content'],
  paddingEnd: 4, // account for any focus rings on the last item in the cell
  color: {
    default: baseColor('neutral-subdued'),
    isSelected: baseColor('neutral'),
    isDisabled: {
      default: 'gray-400',
      forcedColors: 'GrayText'
    },
    forcedColors: 'ButtonText'
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
      default: 'blue-900',
      forcedColors: 'ButtonBorder'
    }
  },
  forcedColorAdjust: 'none'
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

let treeRowFocusRing = style({
  ...focusRing(),
  outlineOffset: -2,
  outlineWidth: 2,
  outlineColor: {
    default: 'focus-ring',
    forcedColors: 'ButtonBorder'
  },
  position: 'absolute',
  inset: 0,
  top: {
    default: '[-1px]',
    isFirstItem: 0
  },
  bottom: {
    default: 0,
    isNextSelected: '[-1px]',
    isSelected: {
      default: 0,
      isNextSelected: 0
    }
  },
  borderRadius: 'default', // tokens say 12... but that seems a lot, should it match selection in other collections?
  zIndex: 1,
  pointerEvents: 'none'
});

const treeRowLink = style({
  // The link is a grid so its own children (icon/content) lay out via treeIcon/treeContent,
  // while the anchor keeps its box (and stays focusable, unlike display: contents).
  display: 'grid',
  gridArea: 'content',
  gridTemplateColumns: ['auto', '1fr'],
  gridTemplateAreas: ['icon content'],
  alignItems: 'center',
  minWidth: 0,
  outlineStyle: 'none',
  textDecoration: 'none',
  color: 'inherit',
  cursor: 'pointer'
});

const SideNavItemContext = createContext<{
  /** Whether the item is selected, used to mark its link with aria-current="page". */
  isCurrent?: boolean;
}>({});

export const SideNavItem = (props: SideNavItemProps): ReactNode => {
  return <TreeItem {...props} focusMode="child" className={renderProps => treeRow(renderProps)} />;
};

export interface SideNavItemContentProps extends Omit<TreeItemContentProps, 'children'> {
  /** Rendered contents of the tree item or child items. */
  children: ReactNode;
}

const selectedIndicator = style<{isDisabled: boolean}>({
  position: 'absolute',
  backgroundColor: {
    default: 'neutral',
    isDisabled: 'disabled',
    forcedColors: {
      default: 'Highlight',
      isDisabled: 'GrayText'
    }
  },
  height: 18,
  width: '[2px]',
  contain: 'strict',
  transition: {
    default: '[translate,width,height]',
    '@media (prefers-reduced-motion: reduce)': 'none'
  },
  transitionDuration: 200,
  transitionTimingFunction: 'out',
  top: '50%',
  transform: 'translateY(-50%)',
  insetStart: 4,
  borderStyle: 'none',
  borderRadius: 'full'
});

const hoveredIndicator = style({
  position: 'absolute',
  backgroundColor: {
    default: 'neutral-subdued',
    forcedColors: 'Highlight'
  },
  height: 18,
  width: '[2px]',
  contain: 'strict',
  top: '50%',
  transform: 'translateY(-50%)',
  insetStart: 4,
  borderStyle: 'none',
  borderRadius: 'full'
});

export const SideNavItemContent = (props: SideNavItemContentProps): ReactNode => {
  let {children} = props;
  let scale = useScale();
  let ref = useRef<HTMLDivElement | null>(null);
  let {stateRef} = useContext(InternalSideNavContext);

  return (
    <TreeItemContent>
      {({
        isExpanded,
        hasChildItems,
        isDisabled,
        isSelected,
        id,
        state,
        isHovered,
        isFocusVisibleWithin
      }) => {
        // Bridge the tree state up to SideNav so its arrow-key handler can toggle expansion.
        if (stateRef) {
          stateRef.current = state;
        }
        return (
          <>
            {isHovered && <div className={hoveredIndicator} />}
            <SelectionIndicator ref={ref} className={selectedIndicator({isDisabled})} />
            <div
              className={treeCellGrid({
                isDisabled,
                isNextSelected: isNextSelected(id, state),
                isSelected
              })}>
              {isFocusVisibleWithin && (
                <div
                  className={treeRowFocusRing({
                    isFocusVisible: true,
                    isSelected,
                    isNextSelected: isNextSelected(id, state),
                    isFirstItem: isFirstItem(id, state)
                  })}
                />
              )}
              <div
                className={style({
                  gridArea: 'level-padding',
                  width: 'calc(calc(var(--tree-item-level, 0) - 1) * var(--indent))'
                })}
              />
              <Provider
                values={[
                  [TextContext, {styles: treeContent}],
                  [SideNavItemContext, {isCurrent: isSelected}],
                  [
                    IconContext,
                    {
                      render: centerBaseline({slot: 'icon', styles: treeIcon}),
                      styles: style({size: fontRelative(20), flexShrink: 0})
                    }
                  ]
                ]}>
                {typeof children === 'string' ? <Text>{children}</Text> : children}
              </Provider>
            </div>
            <ExpandableRowChevron
              isDisabled={isDisabled}
              isExpanded={isExpanded}
              scale={scale}
              isHidden={!hasChildItems}
            />
          </>
        );
      }}
    </TreeItemContent>
  );
};

interface ExpandableRowChevronProps {
  isExpanded?: boolean;
  isDisabled?: boolean;
  isRTL?: boolean;
  scale: 'medium' | 'large';
  isHidden?: boolean;
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
  height: 32,
  width: 32,
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
  let [fullProps, ref] = useContextProps(
    {...props, slot: 'chevron'},
    expandButtonRef,
    ButtonContext
  );
  let {isExpanded, scale, isHidden} = fullProps;
  let {direction} = useLocale();

  return (
    <Button
      {...props}
      ref={ref}
      slot="chevron"
      className={renderProps =>
        expandButton({...renderProps, isExpanded, isRTL: direction === 'rtl', scale, isHidden})
      }>
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
    </Button>
  );
}

export interface SideNavSectionProps<T> extends GridListSectionProps<T> {}

export function SideNavSection<T extends object>(props: SideNavSectionProps<T>) {
  return (
    <TreeSection {...props} className={style({marginTop: {':not(:first-child)': 24}})}>
      {props.children}
    </TreeSection>
  );
}

export const SideNavHeader = (props: {children: ReactNode}): ReactNode => {
  return (
    <TreeHeader
      className={style({
        font: 'ui-sm',
        paddingStart: 'edge-to-text',
        marginBottom: '[10px]',
        height: 32
      })}>
      {props.children}
    </TreeHeader>
  );
};

export interface SideNavCategoryProps extends Omit<
  RACTreeItemProps,
  | 'className'
  | 'style'
  | 'href'
  | 'hrefLang'
  | 'target'
  | 'rel'
  | 'download'
  | 'ping'
  | 'referrerPolicy'
  | 'routerOptions'
> {
  /** Whether this item has children, even if not loaded yet. */
  hasChildItems?: boolean;
  counter?: number;
}

export const SideNavCategory = (props: SideNavCategoryProps): ReactNode => {
  return (
    <TreeItem
      {...props}
      className={renderProps =>
        treeRow({
          ...renderProps
        })
      }
    />
  );
};

interface SideNavItemLinkProps extends Omit<LinkProps, 'className' | 'style' | 'children'> {
  /** Whether this item has children, even if not loaded yet. */
  hasChildItems?: boolean;
  /** Rendered contents of the link. */
  children?: ReactNode;
}

export const SideNavItemLink = (props: SideNavItemLinkProps): ReactNode => {
  let {children} = props;
  let {isCurrent} = useContext(SideNavItemContext);
  return (
    <Link {...props} aria-current={isCurrent ? 'page' : undefined} className={treeRowLink}>
      <Provider
        values={[
          [TextContext, {styles: treeContent}],
          [
            IconContext,
            {
              render: centerBaseline({slot: 'icon', styles: treeIcon}),
              styles: style({size: fontRelative(20), flexShrink: 0})
            }
          ]
        ]}>
        {typeof children === 'string' ? <Text>{children}</Text> : children}
      </Provider>
    </Link>
  );
};

function isNextSelected(id: Key | undefined, state: TreeState<unknown>) {
  if (id == null || !state) {
    return false;
  }
  let keyAfter = state.collection.getKeyAfter(id);

  // We need to skip non-item nodes because the selection manager will map non-item nodes to their parent before checking selection
  let node = keyAfter != null ? state.collection.getItem(keyAfter) : null;
  while (node && node.type !== 'item' && keyAfter != null) {
    keyAfter = state.collection.getKeyAfter(keyAfter);
    node = keyAfter != null ? state.collection.getItem(keyAfter) : null;
  }

  return keyAfter != null && state.selectionManager.isSelected(keyAfter);
}

function isFirstItem(id: Key | undefined, state: TreeState<unknown>) {
  if (id == null || !state) {
    return false;
  }
  return state.collection.getFirstKey() === id;
}
