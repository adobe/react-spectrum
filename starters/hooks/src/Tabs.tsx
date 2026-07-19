'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {useTab, useTabList, useTabPanel, type AriaTabListOptions} from 'react-aria/useTabList';
import {
  useTabListState,
  type TabListState,
  type TabListStateOptions
} from 'react-stately/useTabListState';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useObjectRef} from 'react-aria/useObjectRef';
import {useHover} from 'react-aria/useHover';
import {CollectionBuilder, createLeafComponent} from 'react-aria/CollectionBuilder';
import {Collection} from 'react-aria-components/Collection';
import {ItemNode} from 'react-aria/private/collections/BaseCollection';
import type {Collection as ICollection, Key, Node} from '@react-types/shared';
import {createContext, Fragment, useContext, useRef} from 'react';
import type {ForwardedRef, ReactNode} from 'react';
import './Tabs.css';

let TabListStateContext = createContext<TabListState<object> | null>(null);

export interface TabProps {
  id?: Key;
  title?: ReactNode;
  children?: ReactNode;
}

export const Tab = createLeafComponent(
  ItemNode,
  function Tab(_props: TabProps, forwardedRef: ForwardedRef<HTMLDivElement>, item: Node<object>) {
    let state = useContext(TabListStateContext)!;
    let ref = useObjectRef(forwardedRef);
    let {tabProps, isSelected, isDisabled, isPressed} = useTab({key: item.key}, state, ref);
    let {hoverProps, isHovered} = useHover({isDisabled});
    let {focusProps, isFocusVisible} = useFocusRing();

    return (
      <div
        {...mergeProps(tabProps, hoverProps, focusProps)}
        ref={ref}
        className="react-aria-Tab"
        data-selected={isSelected || undefined}
        data-disabled={isDisabled || undefined}
        data-pressed={isPressed || undefined}
        data-hovered={isHovered || undefined}
        data-focus-visible={isFocusVisible || undefined}>
        {item.props.title}
        <span className="react-aria-SelectionIndicator" />
      </div>
    );
  }
);

export function Tabs(props: AriaTabListOptions<object> & TabListStateOptions<object>) {
  return (
    <CollectionBuilder content={<Collection {...props} />}>
      {collection => <TabsInner {...props} collection={collection} />}
    </CollectionBuilder>
  );
}

function TabsInner({
  collection,
  ...props
}: AriaTabListOptions<object> &
  Omit<TabListStateOptions<object>, 'children'> & {
    collection: ICollection<Node<object>>;
  }) {
  let state = useTabListState({...props, collection, children: undefined});
  let ref = useRef<HTMLDivElement>(null);
  /*- begin highlight -*/
  let {tabListProps} = useTabList(props, state, ref);
  /*- end highlight -*/
  let orientation = props.orientation || 'horizontal';

  return (
    <div className="react-aria-Tabs" data-orientation={orientation}>
      <div
        {...tabListProps}
        ref={ref}
        className="react-aria-TabList"
        data-orientation={orientation}>
        <TabListStateContext.Provider value={state}>
          {[...state.collection].map(item => (
            <Fragment key={item.key}>{item.render!(item)}</Fragment>
          ))}
        </TabListStateContext.Provider>
      </div>
      {/* Re-mount the panel when the selection changes so DOM state isn't shared between tabs. */}
      <TabPanel key={state.selectedItem?.key} state={state} />
    </div>
  );
}

function TabPanel({state, ...props}: {state: TabListState<object>}) {
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
