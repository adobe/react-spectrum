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
  TabListStateContext
} from 'react-aria-components';
import {centerBaseline} from './CenterBaseline';
import {Collection, DOMRef, DOMRefValue, FocusableRef, FocusableRefValue, Key, Node, Orientation, RefObject} from '@react-types/shared';
import {CollectionBuilder} from '@react-aria/collections';
import {createContext, forwardRef, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {focusRing, size, style} from '../style' with {type: 'macro'};
import {getAllowedOverrides, StyleProps, StylesPropWithHeight, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {IconContext} from './Icon';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {Picker, PickerItem} from './TabsPicker';
import {Text, TextContext} from './Content';
import {useControlledState} from '@react-stately/utils';
import {useDOMRef} from '@react-spectrum/utils';
import {useEffectEvent, useId, useLayoutEffect, useResizeObserver} from '@react-aria/utils';
import {useHasTabbableChild} from '@react-aria/focus';
import {useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface TabsProps extends Omit<AriaTabsProps, 'className' | 'style' | 'children'>, UnsafeStyles {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight,
  /** The content to display in the tabs. */
  children?: ReactNode,
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

export interface TabListProps<T> extends Omit<AriaTabListProps<T>, 'style' | 'className'>, StyleProps {}

export interface TabPanelProps extends Omit<AriaTabPanelProps, 'children' | 'style' | 'className'>, UnsafeStyles {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight,
  /** The content to display in the tab panels. */
  children?: ReactNode
}

export const TabsContext = createContext<ContextValue<TabsProps, DOMRefValue<HTMLDivElement>>>(null);
const InternalTabsContext = createContext<TabsProps & {pickerRef?: FocusableRef<HTMLButtonElement>}>({});
const CollapseContext = createContext({
  showTabs: true,
  menuId: ''
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
export const Tabs = forwardRef(function Tabs(props: TabsProps, ref: DOMRef<HTMLDivElement>) {
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
  let pickerRef = useRef<FocusableRefValue<HTMLButtonElement>>(null);

  return (
    <Provider
      values={[
        [InternalTabsContext, {
          density,
          isDisabled,
          orientation,
          disabledKeys,
          selectedKey: value,
          onSelectionChange: setValue,
          labelBehavior,
          pickerRef
        }]
      ]}>
      <CollectionBuilder content={props.children}>
        {collection => (
          <CollapsingTabs
            {...props}
            selectedKey={value}
            onSelectionChange={setValue}
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
  paddingEnd: {
    orientation: {
      vertical: 20
    }
  },
  paddingStart: {
    orientation: {
      vertical: 12
    }
  },
  flexShrink: 0,
  flexBasis: '[0%]'
});

export function TabList<T extends object>(props: TabListProps<T>) {
  let {showTabs} = useContext(CollapseContext) ?? {};

  if (showTabs) {
    return <TabListInner {...props} />;
  }
}

function TabListInner<T extends object>(props: TabListProps<T>) {
  let {density, isDisabled, disabledKeys, orientation, labelBehavior} = useContext(InternalTabsContext) ?? {};
  let state = useContext(TabListStateContext);
  let [selectedTab, setSelectedTab] = useState<HTMLElement | undefined>(undefined);
  let tablistRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (tablistRef?.current) {
      let tab: HTMLElement | null = tablistRef.current.querySelector('[role=tab][data-selected=true]');

      if (tab != null) {
        setSelectedTab(tab);
      }
    }
  }, [tablistRef, state?.selectedItem?.key]);

  return (
    <div
      style={props.UNSAFE_style}
      className={(props.UNSAFE_className || '') + style({position: 'relative'}, getAllowedOverrides())(null, props.styles)}>
      {orientation === 'vertical' &&
        <TabLine disabledKeys={disabledKeys} isDisabled={isDisabled} selectedTab={selectedTab} orientation={orientation} density={density} />}
      <RACTabList
        {...props}
        ref={tablistRef}
        className={renderProps => tablist({...renderProps, labelBehavior, density})} />
      {orientation === 'horizontal' &&
        <TabLine showItems disabledKeys={disabledKeys} isDisabled={isDisabled} selectedTab={selectedTab} orientation={orientation} density={density} />}
    </div>
  );
}

interface TabLineProps {
  disabledKeys: Iterable<Key> | undefined,
  isDisabled: boolean | undefined,
  selectedTab: HTMLElement | undefined,
  orientation?: Orientation,
  density?: 'compact' | 'regular',
  showItems?: boolean
}

const selectedIndicator = style({
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
    orientation: {
      horizontal: '[2px]'
    }
  },
  width: {
    orientation: {
      vertical: '[2px]'
    }
  },
  bottom: {
    orientation: {
      horizontal: 0
    }
  },
  borderStyle: 'none',
  borderRadius: 'full',
  transitionDuration: 130,
  transitionTimingFunction: 'in-out'
});

function TabLine(props: TabLineProps) {
  let {
    disabledKeys,
    isDisabled: isTabsDisabled,
    selectedTab,
    orientation,
    density
  } = props;
  let {direction} = useLocale();
  let state = useContext(TabListStateContext);

  let isDisabled = useMemo(() => {
    return isTabsDisabled || isAllTabsDisabled(state?.collection, disabledKeys ? new Set(disabledKeys) : new Set());
  }, [state?.collection, disabledKeys, isTabsDisabled]);

  let [style, setStyle] = useState<{transform: string | undefined, width: string | undefined, height: string | undefined}>({
    transform: undefined,
    width: undefined,
    height: undefined
  });

  let onResize = useCallback(() => {
    if (selectedTab) {
      let styleObj: { transform: string | undefined, width: string | undefined, height: string | undefined } = {
        transform: undefined,
        width: undefined,
        height: undefined
      };

      // In RTL, calculate the transform from the right edge of the tablist so that resizing the window doesn't break the Tabline position due to offsetLeft changes
      let offset = direction === 'rtl' ? -1 * ((selectedTab.offsetParent as HTMLElement)?.offsetWidth - selectedTab.offsetWidth - selectedTab.offsetLeft) : selectedTab.offsetLeft;
      styleObj.transform = orientation === 'vertical'
        ? `translateY(${selectedTab.offsetTop}px)`
        : `translateX(${offset}px)`;

      if (orientation === 'horizontal') {
        styleObj.width = `${selectedTab.offsetWidth}px`;
      } else {
        styleObj.height = `${selectedTab.offsetHeight}px`;
      }
      setStyle(styleObj);
    }
  }, [direction, setStyle, selectedTab, orientation]);

  useLayoutEffect(() => {
    onResize();
  }, [onResize, state?.selectedItem?.key, density]);

  let ref = useRef<HTMLElement | undefined>(selectedTab);
  // assign ref before the useResizeObserver useEffect runs
  useLayoutEffect(() => {
    ref.current = selectedTab;
  });
  useResizeObserver({ref, onResize});

  return (
    <div style={{...style}} className={selectedIndicator({isDisabled, orientation})} />
  );
}

const tab = style({
  ...focusRing(),
  display: 'flex',
  color: {
    default: 'neutral-subdued',
    isSelected: 'neutral',
    isHovered: 'neutral-subdued',
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
  }
}, getAllowedOverrides());

const icon = style({
  display: 'block',
  flexShrink: 0,
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

export function Tab(props: TabProps) {
  let {density, labelBehavior} = useContext(InternalTabsContext) ?? {};

  return (
    <RACTab
      {...props}
      // @ts-ignore
      originalProps={props}
      style={props.UNSAFE_style}
      className={renderProps => (props.UNSAFE_className || '') + tab({...renderProps, density, labelBehavior}, props.styles)}>
      {({
          // @ts-ignore
          isMenu
        }) => {
        if (isMenu) {
          return props.children;
        } else {
          return (
            <Provider
              values={[
                [TextContext, {
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
              {typeof props.children === 'string' ? <Text>{props.children}</Text> : props.children}
            </Provider>
          );
        }
      }}
    </RACTab>
  );
}

const tabPanel = style({
  display: 'flex',
  marginTop: 4,
  marginX: -4,
  paddingX: 4,
  color: 'gray-800',
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: '[0%]',
  minHeight: 0,
  minWidth: 0,
  overflow: 'auto'
}, getAllowedOverrides({height: true}));

export function TabPanel(props: TabPanelProps) {
  let {showTabs} = useContext(CollapseContext);
  let {selectedKey} = useContext(InternalTabsContext);
  if (showTabs) {
    return (
      <AriaTabPanel
        {...props}
        style={props.UNSAFE_style}
        className={(props.UNSAFE_className ?? '') + tabPanel(null, props.styles)} />
    );
  }

  if (props.id !== selectedKey) {
    return null;
  }

  return <CollapsedTabPanel {...props} />;
}

function CollapsedTabPanel(props: TabPanelProps) {
  let {UNSAFE_style, UNSAFE_className = '', ...otherProps} = props;
  let {menuId} = useContext(CollapseContext);
  let ref = useRef(null);
  let tabIndex = useHasTabbableChild(ref) ? undefined : 0;

  return (
    <Group
      {...otherProps}
      ref={ref}
      aria-labelledby={menuId}
      tabIndex={tabIndex}
      style={UNSAFE_style}
      className={UNSAFE_className + tabPanel(null, props.styles)} />
  );
}

function isAllTabsDisabled<T>(collection: Collection<Node<T>> | undefined, disabledKeys: Set<Key>) {
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
      inert="true"
      ref={listRef}
      className={style({
        display: '[inherit]',
        flexDirection: '[inherit]',
        gap: '[inherit]',
        flexWrap: '[inherit]',
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

let TabsMenu = (props: {items: Array<Node<any>>, onSelectionChange: TabsProps['onSelectionChange']} & TabsProps) => {
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  let {id, items} = props;
  let {density, onSelectionChange, selectedKey, isDisabled, disabledKeys, pickerRef, labelBehavior} = useContext(InternalTabsContext);
  let state = useContext(TabListStateContext);
  let allKeysDisabled = useMemo(() => {
    return isAllTabsDisabled(state?.collection, disabledKeys ? new Set(disabledKeys) : new Set());
  }, [state?.collection, disabledKeys]);

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
        aria-label={props['aria-label'] ?? stringFormatter.format('tabs.selectorLabel')}
        aria-labelledby={props['aria-labelledby']}
        aria-describedby={props['aria-describedby']}
        aria-details={props['aria-details']}
        ref={pickerRef ? pickerRef : undefined}
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

  useEffect(() => {
    // Recalculate visible tags when fonts are loaded.
    document.fonts?.ready.then(() => updateOverflow());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let menuId = useId();

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
        <TabsMenu id={menuId} items={children} onSelectionChange={onSelectionChange} />
        <CollapseContext.Provider value={{showTabs: false, menuId}}>
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
      <CollapseContext.Provider value={{showTabs: true, menuId}}>
        {contents}
      </CollapseContext.Provider>
    </div>
  );
};
