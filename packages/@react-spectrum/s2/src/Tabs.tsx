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
  TabListProps as AriaTabListProps,
  TabPanel as AriaTabPanel,
  TabPanelProps as AriaTabPanelProps,
  TabProps as AriaTabProps,
  TabsProps as AriaTabsProps,
  ContextValue,
  Group,
  Provider,
  Tab as RACTab,
  TabList as RACTabList,
  Tabs as RACTabs,
  TabListStateContext,
  TabRenderProps
} from 'react-aria-components';
import {baseColor, focusRing, size, style} from '../style' with {type: 'macro'};
import {centerBaseline} from './CenterBaseline';
import {Collection, DOMRef, DOMRefValue, Key, Node, Orientation, RefObject} from '@react-types/shared';
import {CollectionBuilder} from '@react-aria/collections';
import {Context, createContext, forwardRef, ForwardRefExoticComponent, ReactNode, RefAttributes, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {getAllowedOverrides, StyleProps, StylesPropWithHeight, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {IconContext} from './Icon';
import {inertValue, useEffectEvent, useId, useLabels, useLayoutEffect, useResizeObserver} from '@react-aria/utils';
import {Picker, PickerItem} from './TabsPicker';
import {Text, TextContext} from './Content';
import {useControlledState} from '@react-stately/utils';
import {useDOMRef, useMediaQuery} from '@react-spectrum/utils';
import {useHasTabbableChild} from '@react-aria/focus';
import {useLocale} from '@react-aria/i18n';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface TabsProps extends Omit<AriaTabsProps, 'className' | 'style' | 'children'>, UnsafeStyles {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight,
  /** The content to display in the tabs. */
  children: ReactNode,
  /**
   * The amount of space between the tabs.
   * @default 'regular'
   */
  density?: 'compact' | 'regular',
  /**
   * Defines if the text within the tabs should be hidden and only the icon should be shown.
   * The text is always visible when the item is collapsed into a picker.
   * @default 'show'
   */
  labelBehavior?: 'show' | 'hide'
}

export interface TabProps extends Omit<AriaTabProps, 'children' | 'style' | 'className'>, StyleProps {
  /** The content to display in the tab. */
  children: ReactNode
}

export interface TabListProps<T> extends Omit<AriaTabListProps<T>, 'style' | 'className' | 'aria-label' | 'aria-labelledby'>, StyleProps {
  /** The content to display in the tablist. */
  children: ReactNode | ((item: T) => ReactNode)
}

export interface TabPanelProps extends Omit<AriaTabPanelProps, 'children' | 'style' | 'className'>, UnsafeStyles {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight,
  /** The content to display in the tab panels. */
  children: ReactNode
}

export const TabsContext:
  Context<ContextValue<Partial<TabsProps>, DOMRefValue<HTMLDivElement>>> =
createContext<ContextValue<Partial<TabsProps>, DOMRefValue<HTMLDivElement>>>(null);

const InternalTabsContext = createContext<Partial<TabsProps> & {
  tablistRef?: RefObject<HTMLDivElement | null>,
  prevRef?: RefObject<DOMRect | null>,
  selectedKey?: Key | null
}>({});
const CollapseContext = createContext({
  showTabs: true,
  menuId: '',
  valueId: ''
});

const tabs = style({
  position: 'relative',
  display: 'flex',
  flexShrink: 0,
  font: 'ui',
  flexDirection: {
    orientation: {
      horizontal: 'column'
    }
  }
}, getAllowedOverrides({height: true}));

/**
 * Tabs organize content into multiple sections and allow users to navigate between them. The content under the set of tabs should be related and form a coherent unit.
 */
export const Tabs:
  ForwardRefExoticComponent<TabsProps & RefAttributes<DOMRefValue<HTMLDivElement>>> =
forwardRef(function Tabs(props: TabsProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, TabsContext);
  let {
    density = 'regular',
    isDisabled,
    disabledKeys,
    orientation = 'horizontal',
    labelBehavior = 'show'
  } = props;
  let domRef = useDOMRef(ref);
  let [value, setValue] = useControlledState(props.selectedKey, props.defaultSelectedKey ?? null!, props.onSelectionChange);

  if (!props['aria-label'] && !props['aria-labelledby']) {
    throw new Error('An aria-label or aria-labelledby prop is required on Tabs for accessibility.');
  }

  let tablistRef = useRef<HTMLDivElement | null>(null);
  let prevRef = useRef<DOMRect | null>(null);

  let onChange = useEffectEvent((val: Key) => {
    if (tablistRef.current) {
      prevRef.current = tablistRef.current.querySelector('[role=tab][data-selected=true]')?.getBoundingClientRect() ?? null;
    }
    setValue(val);
  });

  return (
    <Provider
      values={[
        [InternalTabsContext, {
          density,
          isDisabled,
          orientation,
          disabledKeys,
          selectedKey: value,
          tablistRef,
          prevRef,
          onSelectionChange: onChange,
          labelBehavior,
          'aria-label': props['aria-label'],
          'aria-labelledby': props['aria-labelledby']
        }]
      ]}>
      <CollectionBuilder content={props.children}>
        {collection => (
          <CollapsingTabs
            {...props}
            selectedKey={value}
            onSelectionChange={onChange}
            collection={collection}
            containerRef={domRef} />
        )}
      </CollectionBuilder>
    </Provider>
  );
});

const tablist = style({
  display: 'flex',
  gap: {
    orientation: {
      horizontal: {
        density: {
          compact: 24,
          regular: 32
        },
        labelBehavior: {
          hide: {
            density: {
              compact: 16,
              regular: 24
            }
          }
        }
      }
    }
  },
  flexDirection: {
    orientation: {
      vertical: 'column'
    }
  },
  marginEnd: {
    orientation: {
      vertical: 20
    }
  },
  marginStart: {
    orientation: {
      vertical: 12
    }
  },
  flexShrink: 0,
  flexBasis: '0%'
});

export function TabList<T extends object>(props: TabListProps<T>): ReactNode | null {
  let {showTabs} = useContext(CollapseContext) ?? {};

  if (showTabs) {
    return <TabListInner {...props} />;
  }
  return null;
}

function TabListInner<T extends object>(props: TabListProps<T>) {
  let {
    tablistRef,
    density,
    labelBehavior,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy
  } = useContext(InternalTabsContext) ?? {};

  return (
    <div
      style={props.UNSAFE_style}
      className={(props.UNSAFE_className || '') + style({position: 'relative'}, getAllowedOverrides())(null, props.styles)}>
      <RACTabList
        {...props}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        ref={tablistRef}
        className={renderProps => tablist({...renderProps, labelBehavior, density})} />
    </div>
  );
}

const selectedIndicator = style<{isDisabled: boolean, orientation?: Orientation}>({
  position: 'absolute',
  backgroundColor: {
    default: 'neutral',
    isDisabled: 'disabled',
    forcedColors: {
      default: 'Highlight',
      isDisabled: 'GrayText'
    }
  },
  height: {
    default: 'full',
    orientation: {
      horizontal: '[2px]'
    }
  },
  width: {
    default: 'full',
    orientation: {
      vertical: '[2px]'
    }
  },
  bottom: {
    default: 0
  },
  top: {
    orientation: {
      vertical: 0
    }
  },
  left: {
    orientation: {
      horizontal: 0
    }
  },
  insetStart: {
    orientation: {
      vertical: -12
    }
  },
  borderStyle: 'none',
  borderRadius: 'full'
});

const tab = style<TabRenderProps & {density?: 'compact' | 'regular', labelBehavior?: 'show' | 'hide'}>({
  ...focusRing(),
  display: 'flex',
  color: {
    default: baseColor('neutral-subdued'),
    isSelected: baseColor('neutral'),
    isDisabled: 'disabled',
    forcedColors: {
      isSelected: 'Highlight',
      isDisabled: 'GrayText'
    }
  },
  borderRadius: 'sm',
  gap: 'text-to-visual',
  height: {
    density: {
      compact: 32,
      regular: 48
    }
  },
  alignItems: 'center',
  position: 'relative',
  cursor: 'default',
  flexShrink: 0,
  transition: 'default',
  paddingX: {
    labelBehavior: {
      hide: size(6)
    }
  },
  disableTapHighlight: true
}, getAllowedOverrides());

const icon = style({
  display: 'block',
  flexShrink: 0,
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

export function Tab(props: TabProps): ReactNode {
  let {density, orientation, labelBehavior, prevRef} = useContext(InternalTabsContext) ?? {};

  let contentId = useId();
  let ariaLabelledBy = props['aria-labelledby'] || '';

  return (
    <RACTab
      {...props}
      // @ts-ignore
      originalProps={props}
      aria-labelledby={`${labelBehavior === 'hide' ? contentId : ''} ${ariaLabelledBy}`}
      style={props.UNSAFE_style}
      className={renderProps => (props.UNSAFE_className || '') + tab({...renderProps, density, labelBehavior}, props.styles)}>
      {({
          // @ts-ignore
          isMenu,
          isSelected,
          isDisabled
        }) => {
        if (isMenu) {
          return props.children;
        } else {
          return (
            <Provider
              values={[
                [TextContext, {
                  id: contentId,
                  styles:
                    style({
                      order: 1,
                      display: {
                        labelBehavior: {
                          hide: 'none'
                        }
                      }
                    })({labelBehavior})
                }],
                [IconContext, {
                  render: centerBaseline({slot: 'icon', styles: style({order: 0})}),
                  styles: icon
                }]
              ]}>
              <TabInner
                isSelected={isSelected}
                orientation={orientation!}
                isDisabled={isDisabled}
                prevRef={prevRef}>
                {typeof props.children === 'string' ? <Text>{props.children}</Text> : props.children}
              </TabInner>
            </Provider>
          );
        }
      }}
    </RACTab>
  );
}

function TabInner({isSelected, isDisabled, orientation, children, prevRef}: {
  isSelected: boolean,
  isDisabled: boolean,
  orientation: Orientation,
  children: ReactNode,
  prevRef?: RefObject<DOMRect | null>
}) {
  let reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  let ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (isSelected && prevRef?.current && ref?.current && !reduceMotion) {
      let currentItem = ref?.current.getBoundingClientRect();

      if (orientation === 'horizontal') {
        let deltaX = prevRef.current.left - currentItem.left;
        ref.current.animate(
          [
            {transform: `translateX(${deltaX}px)`, width: `${prevRef.current.width}px`},
            {transform: 'translateX(0px)', width: '100%'}
          ],
          {
            duration: 200,
            easing: 'ease-out'
          }
        );
      } else {
        let deltaY = prevRef.current.top - currentItem.top;
        ref.current.animate(
          [
            {transform: `translateY(${deltaY}px)`, height: `${prevRef.current.height}px`},
            {transform: 'translateY(0px)', height: '100%'}
          ],
          {
            duration: 200,
            easing: 'ease-out'
          }
        );
      }

      prevRef.current = null;
    }
  }, [isSelected, reduceMotion, prevRef, orientation]);

  return (
    <>
      {isSelected && <div ref={ref} className={selectedIndicator({isDisabled, orientation})} />}
      {children}
    </>
  );
}


const tabPanel = style({
  ...focusRing(),
  marginTop: 4,
  color: 'gray-800',
  flexGrow: 1,
  flexBasis: '0%',
  minHeight: 0,
  minWidth: 0
}, getAllowedOverrides({height: true}));

export function TabPanel(props: TabPanelProps): ReactNode | null {
  let {showTabs} = useContext(CollapseContext);
  let {selectedKey} = useContext(InternalTabsContext);
  if (showTabs) {
    return (
      <AriaTabPanel
        {...props}
        style={props.UNSAFE_style}
        className={renderProps => (props.UNSAFE_className ?? '') + tabPanel(renderProps, props.styles)} />
    );
  }

  if (props.id !== selectedKey) {
    return null;
  }

  return <CollapsedTabPanel {...props} />;
}

function CollapsedTabPanel(props: TabPanelProps) {
  let {UNSAFE_style, UNSAFE_className = '', ...otherProps} = props;
  let {menuId, valueId} = useContext(CollapseContext);
  let ref = useRef(null);
  let tabIndex = useHasTabbableChild(ref) ? undefined : 0;

  return (
    <Group
      {...otherProps}
      ref={ref}
      aria-labelledby={menuId + ' ' + valueId}
      tabIndex={tabIndex}
      style={UNSAFE_style}
      className={renderProps => UNSAFE_className + tabPanel(renderProps, props.styles)} />
  );
}

function isEveryTabDisabled<T>(collection: Collection<Node<T>> | undefined, disabledKeys: Set<Key>) {
  let testKey: Key | null = null;
  if (collection && collection.size > 0) {
    testKey = collection.getFirstKey();

    let index = 0;
    while (testKey && index < collection.size) {
      // We have to check if the item in the collection has a key in disabledKeys or has the isDisabled prop set directly on it
      if (!disabledKeys.has(testKey) && !collection.getItem(testKey)?.props?.isDisabled) {
        return false;
      }

      testKey = collection.getKeyAfter(testKey);
      index++;
    }
    return true;
  }
  return false;
}

let HiddenTabs = function (props: {
  listRef: RefObject<HTMLDivElement | null>,
  items: Array<Node<any>>,
  size?: string,
  density?: 'compact' | 'regular'
}) {
  let {listRef, items, size, density} = props;

  return (
    <div
      // @ts-ignore
      inert={inertValue(true)}
      ref={listRef}
      className={style({
        display: 'inherit',
        flexDirection: 'inherit',
        gap: 'inherit',
        flexWrap: 'inherit',
        position: 'absolute',
        inset: 0,
        visibility: 'hidden',
        overflow: 'hidden',
        opacity: 0
      })}>
      {items.map((item) => {
        // pull off individual props as an allow list, don't want refs or other props getting through
        return (
          <div
            data-hidden-tab
            style={item.props.UNSAFE_style}
            key={item.key}
            className={item.props.className({size, density})}>
            {item.props.children({size, density})}
          </div>
        );
      })}
    </div>
  );
};

let TabsMenu = (props: {valueId: string, items: Array<Node<any>>, onSelectionChange: TabsProps['onSelectionChange']} & Omit<TabsProps, 'children'>) => {
  let {id, items, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, valueId} = props;
  let {density, onSelectionChange: _onSelectionChange, selectedKey, isDisabled, disabledKeys, labelBehavior} = useContext(InternalTabsContext);
  let onSelectionChange = useCallback((key: Key | null) => {
    if (key != null) {
      _onSelectionChange?.(key);
    }
  }, [_onSelectionChange]);
  let state = useContext(TabListStateContext);
  let allKeysDisabled = useMemo(() => {
    return isEveryTabDisabled(state?.collection, disabledKeys ? new Set(disabledKeys) : new Set());
  }, [state?.collection, disabledKeys]);
  let labelProps = useLabels({
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy
  });

  return (
    <div
      className={style({
        display: 'flex',
        flexShrink: 0,
        alignItems: 'center',
        height: {
          density: {
            compact: 32,
            regular: 48
          }
        }})({density})}>
      <Picker
        id={id}
        valueId={valueId}
        {...labelProps}
        aria-describedby={props['aria-describedby']}
        aria-details={props['aria-details']}
        isDisabled={isDisabled || allKeysDisabled}
        density={density!}
        labelBehavior={labelBehavior}
        items={items}
        disabledKeys={disabledKeys}
        selectedKey={selectedKey}
        onSelectionChange={onSelectionChange}>
        {(item: Node<any>) => {
          return (
            <PickerItem
              {...item.props.originalProps}
              isDisabled={isDisabled || allKeysDisabled}
              key={item.key}>
              {item.props.children({density, isMenu: true})}
            </PickerItem>
          );
        }}
      </Picker>
    </div>
  );
};

let CollapsingTabs = ({collection, containerRef, ...props}: {collection: Collection<Node<unknown>>, containerRef: any} & TabsProps) => {
  let {density = 'regular', orientation = 'horizontal', labelBehavior = 'show', onSelectionChange} = props;
  let [showItems, _setShowItems] = useState(true);
  showItems = orientation === 'vertical' ? true : showItems;
  let setShowItems = useCallback((value: boolean) => {
    if (orientation === 'vertical') {
      // if orientation is vertical, we always show the items
      _setShowItems(true);
    } else {
      _setShowItems(value);
    }
  }, [orientation]);

  let {direction} = useLocale();

  let children = useMemo(() => [...collection], [collection]);

  let listRef = useRef<HTMLDivElement | null>(null);
  let updateOverflow = useEffectEvent(() => {
    if (orientation === 'vertical' || !listRef.current || !containerRef?.current) {
      return;
    }
    let container = listRef.current;
    let containerRect = container.getBoundingClientRect();
    let tabs = container.querySelectorAll('[data-hidden-tab]');
    let lastTab = tabs[tabs.length - 1];
    let lastTabRect = lastTab.getBoundingClientRect();
    if (direction === 'ltr') {
      setShowItems?.(lastTabRect.right <= containerRect.right);
    } else {
      setShowItems?.(lastTabRect.left >= containerRect.left);
    }
  });

  useResizeObserver({ref: containerRef, onResize: updateOverflow});

  useLayoutEffect(() => {
    if (collection.size > 0) {
      queueMicrotask(updateOverflow);
    }
  }, [collection.size, updateOverflow]);

  // start with null so that the first render won't have a flicker
  let prevOrientation = useRef<Orientation | null>(null);
  useLayoutEffect(() => {
    if (collection.size > 0 && prevOrientation.current !== orientation) {
      updateOverflow();
    }
    prevOrientation.current = orientation;
  }, [collection.size, updateOverflow, orientation]);

  useEffect(() => {
    // Recalculate visible tags when fonts are loaded.
    document.fonts?.ready.then(() => updateOverflow());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let menuId = useId();
  let valueId = useId();

  let contents: ReactNode;
  if (showItems) {
    contents = (
      <RACTabs
        {...props}
        style={{display: 'contents'}}>
        {props.children}
      </RACTabs>
    );
  } else {
    contents = (
      <>
        <TabsMenu
          id={menuId}
          valueId={valueId}
          items={children}
          onSelectionChange={onSelectionChange}
          aria-label={props['aria-label']}
          aria-describedby={props['aria-labelledby']} />
        <CollapseContext.Provider value={{showTabs: false, menuId, valueId}}>
          {props.children}
        </CollapseContext.Provider>
      </>
    );
  }

  return (
    <div style={props.UNSAFE_style} className={(props.UNSAFE_className || '') + tabs({orientation}, props.styles)} ref={containerRef}>
      <div className={tablist({orientation, labelBehavior, density})}>
        <HiddenTabs items={children} density={density} listRef={listRef} />
      </div>
      <CollapseContext.Provider value={{showTabs: true, menuId, valueId}}>
        {contents}
      </CollapseContext.Provider>
    </div>
  );
};
