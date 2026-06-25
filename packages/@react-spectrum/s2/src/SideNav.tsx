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
import {edgeToText} from '../style/spectrum-theme' with {type: 'macro'};
import {focusSafely} from 'react-aria/private/interactions/focusSafely';
import {getActiveElement, isFocusWithin} from 'react-aria/private/utils/shadowdom/DOMFunctions';
import {
  getAllowedOverrides,
  StylesPropWithHeight,
  UnsafeStyles
} from './style-utils' with {type: 'macro'};
import {getFocusableTreeWalker} from 'react-aria/private/focus/FocusScope';
import {IconContext} from './Icon';
import {Link} from 'react-aria-components/Link';
import {Provider, useContextProps} from 'react-aria-components/slots';
import {
  TreeItemProps as RACTreeItemProps,
  TreeProps as RACTreeProps,
  Tree,
  TreeHeader,
  TreeItem,
  TreeItemContent,
  TreeItemRenderProps,
  TreeRenderProps,
  TreeSection,
  TreeStateContext
} from 'react-aria-components/Tree';
import React, {
  createContext,
  forwardRef,
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  useContext,
  useRef
} from 'react';
import {SelectionIndicator} from 'react-aria-components/SelectionIndicator';
import {Text, TextContext} from './Content';
import {TreeState} from 'react-stately/useTreeState';
import {useDOMRef} from './useDOMRef';
import {useKeyboard} from 'react-aria/useKeyboard';
import {useLocale} from 'react-aria/I18nProvider';
import {useScale} from './utils';

interface S2SideNavProps {}

interface SideNavStyleProps {}

export interface TreeViewProps<T>
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
    S2SideNavProps,
    SideNavStyleProps {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight;
}

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

let InternalSideNavContext = createContext({});

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

  return (
    <div
      ref={domRef}
      className={(UNSAFE_className ?? '') + sideNavWrapper(props.styles)}
      style={UNSAFE_style}>
      <TreeRendererContext.Provider value={{renderer}}>
        <InternalSideNavContext.Provider value={{}}>
          <Tree
            {...props}
            style={{
              paddingBottom: 0,
              scrollPaddingBottom: 0
            }}
            className={renderProps => tree(renderProps)}
            selectionBehavior="replace"
            selectionMode="single"
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
  gridTemplateColumns: [12, 'auto', 'auto', '1fr', 'auto'],
  gridTemplateRows: '1fr',
  gridTemplateAreas: ['. level-padding icon content expand-button'],
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

const SideNavItemContext = createContext<{href?: string}>({});
export const SideNavItem = (props: SideNavItemProps, ref: DOMRef<HTMLDivElement>): ReactNode => {
  let {href, hrefLang, target, rel, download, ping, referrerPolicy, routerOptions, ...rest} = props;
  let backupRef = useRef<HTMLDivElement | null>(null);
  let domRef = ref || backupRef;

  let keyWhenFocused = useRef<Key | null>(null);
  let focus = () => {
    if (domRef.current) {
      let treeWalker = getFocusableTreeWalker(domRef.current);
      // If focus is already on a focusable child within the cell, early return so we don't shift focus
      if (isFocusWithin(domRef.current) && domRef.current !== getActiveElement()) {
        return;
      }

      let focusable = treeWalker.firstChild() as FocusableElement;
      if (focusable) {
        focusSafely(focusable);
        return;
      }

      if (
        (keyWhenFocused.current != null && node.key !== keyWhenFocused.current) ||
        !isFocusWithin(domRef.current)
      ) {
        focusSafely(domRef.current);
      }
    }
  };

  let onFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    props?.onFocus?.(e);
    requestAnimationFrame(() => {
      focus();
    });
  };

  return (
    <SideNavItemContext.Provider
      value={{href, hrefLang, target, rel, download, ping, referrerPolicy, routerOptions}}>
      <TreeItem
        {...rest}
        allowChildKeys
        onFocus={onFocus}
        ref={domRef}
        className={renderProps => treeRow(renderProps)}
      />
    </SideNavItemContext.Provider>
  );
};

export interface SideNavItemContentProps extends Omit<SideNavItemContentProps, 'children'> {
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
  let {href, hrefLang, target, rel, download, ping, referrerPolicy, routerOptions} =
    useContext(SideNavItemContext);
  let ref = useRef<HTMLDivElement | null>(null);

  if (href) {
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
          isFocusVisible
        }) => {
          return (
            <>
              {isHovered && <div className={hoveredIndicator} />}
              <SelectionIndicator ref={ref} className={selectedIndicator({isDisabled})} />
              <Link
                href={href}
                target={target}
                hrefLang={hrefLang}
                rel={rel}
                download={download}
                ping={ping}
                referrerPolicy={referrerPolicy}
                routerOptions={routerOptions}
                className={style({outlineStyle: 'none', textDecoration: 'none'})}>
                {({isFocusVisible: linkFocusVisible}) => {
                  return (
                    <div
                      className={treeCellGrid({
                        isDisabled,
                        isNextSelected: isNextSelected(id, state),
                        isSelected
                      })}>
                      {(linkFocusVisible || isFocusVisible) && (
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
                  );
                }}
              </Link>
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
  }

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
        isFocusVisible
      }) => {
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
              {isFocusVisible && (
                <div
                  className={treeRowFocusRing({
                    isFocusVisible,
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

export interface SideNavSectionProps<T> extends SectionProps<T> {}

export function SideNavSection<T extends object>(props: SideNavSectionProps<T>) {
  return (
    <TreeSection {...props} className={style({marginTop: {':not(:first-child)': 24}})}>
      {props.children}
    </TreeSection>
  );
}

export const SideNavHeader = forwardRef<HTMLElement, {children: ReactNode}>((props, ref) => {
  return (
    <TreeHeader
      ref={ref}
      className={style({
        font: 'ui-sm',
        paddingStart: edgeToText(32),
        marginBottom: '[10px]'
      })}>
      {props.children}
    </TreeHeader>
  );
});

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
