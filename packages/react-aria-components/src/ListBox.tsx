import {AriaListBoxProps} from '@react-types/listbox';
import {ListState, OverlayTriggerState, useListState} from 'react-stately';
import {Node, SelectionBehavior} from '@react-types/shared';
import React, {cloneElement, createContext, ForwardedRef, forwardRef, useContext, useEffect, useRef} from 'react';
import {RenderProps, StyleProps, useContextProps, useRenderProps, WithRef} from './utils';
import {useListBox, useOption} from 'react-aria';

interface OptionRenderProps {
  isFocused: boolean,
  isSelected: boolean,
  isDisabled: boolean
}

interface ListBoxProps<T> extends AriaListBoxProps<T>, StyleProps {
  /** How multiple selection should behave in the collection. */
  selectionBehavior?: SelectionBehavior
}

interface ListBoxContextValue<T> extends WithRef<Omit<AriaListBoxProps<T>, 'children'>, HTMLElement> {
  state?: ListState<T> & OverlayTriggerState,
  setListBoxProps?: (props: AriaListBoxProps<T>) => void
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
  return !state || state.isOpen ? <ListBoxInner state={state} props={props} listBoxRef={ref} /> : null;
}

const _ListBox = forwardRef(ListBox);
export {_ListBox as ListBox};

function ListBoxInner({state, props, listBoxRef}) {
  // if a state is provided via context, it will always be there.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  state = state || useListState(props);
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

interface OptionProps<T> extends RenderProps<OptionRenderProps> {
  item: Node<T>
}

export function Option<T>({item, className, style, children}: OptionProps<T>) {
  let ref = useRef();
  let {state} = useContext(InternalListBoxContext);
  let {optionProps, isSelected, isDisabled, isFocused} = useOption(
    {key: item.key},
    state,
    ref
  );

  // Determine whether we should show a keyboard
  // focus ring for accessibility
  // let { isFocusVisible, focusProps } = useFocusRing();

  let renderProps = useRenderProps({
    className: className || item.props.className,
    style: style || item.props.style,
    children: children || item.rendered,
    values: {
      isFocused,
      isSelected,
      isDisabled
    }
  });

  return <li {...optionProps} {...renderProps} ref={ref} />;
}
