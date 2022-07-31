import {AriaListBoxProps} from '@react-types/listbox';
import {DOMProps, Provider, RenderProps, StyleProps, useContextProps, useRenderProps, WithRef} from './utils';
import {isFocusVisible} from '@react-aria/interactions';
import {ItemStates, useCachedChildren, useCollection} from './Collection';
import {ListState, OverlayTriggerState, useListState} from 'react-stately';
import {Node, SelectionBehavior} from '@react-types/shared';
import React, {createContext, ForwardedRef, forwardRef, RefObject, useContext, useEffect, useRef} from 'react';
import {Separator, SeparatorContext} from './Separator';
import {useListBox, useListBoxSection, useOption} from 'react-aria';

export interface ListBoxProps<T> extends Omit<AriaListBoxProps<T>, 'children'>, DOMProps {
  /** How multiple selection should behave in the collection. */
  selectionBehavior?: SelectionBehavior
}

interface ListBoxContextValue<T> extends WithRef<Omit<AriaListBoxProps<T>, 'children'>, HTMLUListElement> {
  state?: ListState<T> & OverlayTriggerState,
  setListBoxProps?: (props: ListBoxProps<T>) => void
}

export const ListBoxContext = createContext<ListBoxContextValue<unknown>>(null);
const InternalListBoxContext = createContext<ListState<unknown>>(null);

function ListBox<T>(props: ListBoxProps<T>, ref: ForwardedRef<HTMLUListElement>) {
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

interface ListBoxInnerProps<T> {
  state: ListState<T>,
  props: ListBoxProps<T>,
  listBoxRef: RefObject<HTMLUListElement>
}

function ListBoxInner<T>({state, props, listBoxRef}: ListBoxInnerProps<T>) {
  let {listBoxProps} = useListBox(props, state, listBoxRef);

  let children = useCachedChildren({
    items: state.collection,
    children: (item: Node<T>) => {
      switch (item.type) {
        case 'section':
          return <ListBoxSection section={item} />;
        case 'separator':
          return <Separator {...item.props} />;
        case 'item':
          return <Option item={item} />;
        default:
          throw new Error('Unsupported node type in Menu: ' + item.type);
      }
    }
  });

  return (
    <ul
      {...listBoxProps}
      ref={listBoxRef}
      style={props.style}
      className={props.className}>
      <Provider
        values={[
          [InternalListBoxContext, state],
          [SeparatorContext, {elementType: 'li'}]
        ]}>
        {children}
      </Provider>
    </ul>
  );
}

interface ListBoxSectionProps<T> extends StyleProps {
  section: Node<T>
}

function ListBoxSection<T>({section, className, style}: ListBoxSectionProps<T>) {
  let {itemProps, headingProps, groupProps} = useListBoxSection({
    heading: section.rendered,
    'aria-label': section['aria-label']
  });

  let children = useCachedChildren({
    items: section.childNodes,
    children: item => {
      if (item.type !== 'item') {
        throw new Error('Only items are allowed within a section');
      }

      return <Option item={item} />;
    }
  });

  return (
    <li {...itemProps} style={{display: 'contents'}}>
      {section.rendered &&
        <span {...headingProps} style={{display: 'contents'}}>
          {section.rendered}
        </span>
      }
      <ul 
        {...groupProps}
        className={className || section.props?.className}
        style={style || section.props?.style}>
        {children}
      </ul>
    </li>
  );
}

interface OptionProps<T> extends RenderProps<ItemStates> {
  item: Node<T>
}

function Option<T>({item, className, style, children}: OptionProps<T>) {
  let ref = useRef();
  let state = useContext(InternalListBoxContext);
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
