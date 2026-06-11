'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {useTab, useTabList, useTabPanel, type AriaTabListOptions} from 'react-aria/useTabList';
import {useTabListState} from 'react-stately/useTabListState';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import type {Node} from '@react-types/shared';
import {useRef} from 'react';
import './Tabs.css';

export function Tabs(props: AriaTabListOptions<object> & Parameters<typeof useTabListState>[0]) {
  let state = useTabListState(props);
  let ref = useRef<HTMLDivElement>(null);
  let {tabListProps} = useTabList(props, state, ref);
  let orientation = props.orientation || 'horizontal';

  return (
    <div className="react-aria-Tabs" data-orientation={orientation}>
      <div
        {...tabListProps}
        ref={ref}
        className="react-aria-TabList"
        data-orientation={orientation}>
        {[...state.collection].map(item => (
          <Tab key={item.key} item={item} state={state} />
        ))}
      </div>
      {/* Re-mount the panel when the selection changes so DOM state isn't shared between tabs. */}
      <TabPanel key={state.selectedItem?.key} state={state} />
    </div>
  );
}

function Tab({item, state}: {item: Node<object>; state: ReturnType<typeof useTabListState>}) {
  let ref = useRef<HTMLDivElement>(null);
  let {tabProps, isSelected, isDisabled} = useTab({key: item.key}, state, ref);
  let {hoverProps, isHovered} = useHover({});
  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <div
      {...mergeProps(tabProps, hoverProps, focusProps)}
      ref={ref}
      className="react-aria-Tab"
      data-selected={isSelected || undefined}
      data-disabled={isDisabled || undefined}
      data-hovered={isHovered || undefined}
      data-focus-visible={isFocusVisible || undefined}>
      {item.rendered}
      {/* The selection indicator is only visible on the selected tab (transparent otherwise). */}
      <span className="react-aria-SelectionIndicator" />
    </div>
  );
}

function TabPanel({state, ...props}: {state: ReturnType<typeof useTabListState>}) {
  let ref = useRef<HTMLDivElement>(null);
  let {tabPanelProps} = useTabPanel(props, state, ref);
  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <div
      {...mergeProps(tabPanelProps, focusProps)}
      ref={ref}
      className="react-aria-TabPanel"
      data-focus-visible={isFocusVisible || undefined}>
      {state.selectedItem?.props.children}
    </div>
  );
}
