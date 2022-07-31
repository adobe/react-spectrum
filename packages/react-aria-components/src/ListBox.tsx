import {AriaListBoxProps} from '@react-types/listbox';
import {DOMProps, RenderProps, useContextProps, useRenderProps, WithRef} from './utils';
import {isFocusVisible} from '@react-aria/interactions';
import {ListState, OverlayTriggerState, useListState} from 'react-stately';
import {Node, SelectionBehavior} from '@react-types/shared';
import React, {cloneElement, createContext, ForwardedRef, forwardRef, useContext, useEffect, useRef} from 'react';
import {SelectableItemStates} from '@react-aria/selection';
import {ItemStates, useCollection} from './Collection';
import {useListBox, useOption} from 'react-aria';

export interface ListBoxProps<T> extends Omit<AriaListBoxProps<T>, 'children'>, DOMProps {
  /** How multiple selection should behave in the collection. */
  selectionBehavior?: SelectionBehavior
}

interface ListBoxContextValue<T> extends WithRef<Omit<AriaListBoxProps<T>, 'children'>, HTMLElement> {
  state?: ListState<T> & OverlayTriggerState,
  setListBoxProps?: (props: ListBoxProps<T>) => void
}

export const ListBoxContext = createContext<ListBoxContextValue<unknown>>(null);
const InternalListBoxContext = createContext(null);

function ListBox<T>(props: ListBoxProps<T>, ref: ForwardedRef<HTMLElement>) {
  let {state, setListBoxProps} = useContext(ListBoxContext) || {};
  useEffect(() => {
    if (setListBoxProps) {
      setListBoxProps(props);
    }
  }, [setListBoxProps, props]);

  [props, ref] = useContextProps(props, ref, ListBoxContext);

  if (state) {
    return state.isOpen ? <ListBoxInner state={state} props={props} listBoxRef={ref} /> : null;
  }
  
  return <ListBoxPortal props={props} listBoxRef={ref} />;
}

function ListBoxPortal({props, listBoxRef}) {
  let {portal, collection} = useCollection(props);
  props = {...props, collection, children: null, items: null};
  let state = useListState(props);
  return (
    <>
      {portal}
      <ListBoxInner state={state} props={props} listBoxRef={listBoxRef} />
    </>
  );
}

const _ListBox = forwardRef(ListBox);
export {_ListBox as ListBox};

function ListBoxInner({state, props, listBoxRef}) {
  let {listBoxProps} = useListBox(props, state, listBoxRef);
  let renderItem = props.renderItem || ((item) => <Option item={item} />);

  return (
    <ul
      {...listBoxProps}
      ref={listBoxRef}
      style={props.style}
      className={props.className}>
      <InternalListBoxContext.Provider value={{state}}>
        {[...state.collection].map(item => cloneElement(renderItem(item), {key: item.key}))}
      </InternalListBoxContext.Provider>
    </ul>
  );
}

interface OptionProps<T> extends RenderProps<ItemStates> {
  item: Node<T>
}

export function Option<T>({item, className, style, children}: OptionProps<T>) {
  let ref = useRef();
  let {state} = useContext(InternalListBoxContext);
  let {optionProps, labelProps, descriptionProps, ...states} = useOption(
    {key: item.key},
    state,
    ref
  );

  let focusVisible = states.isFocused && isFocusVisible();
  let renderProps = useRenderProps({
    className: className || item.props.className,
    style: style || item.props.style,
    children: children || item.rendered,
    values: {
      ...states,
      isFocusVisible: focusVisible
    }
  });

  return (
    <li 
      {...optionProps}
      {...renderProps}
      ref={ref}
      data-focused={states.isFocused || undefined}
      data-focus-visible={focusVisible || undefined}
      data-pressed={states.isPressed || undefined} />
  );
}
