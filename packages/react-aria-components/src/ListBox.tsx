import {AriaListBoxProps} from '@react-types/listbox';
import {CollectionProps, useCachedChildren, useCollection} from './Collection';
import {isFocusVisible} from '@react-aria/interactions';
import {ListState, OverlayTriggerState, useListState} from 'react-stately';
import {Node, SelectionBehavior} from '@react-types/shared';
import {Provider, StyleProps, useContextProps, useRenderProps, WithRef} from './utils';
import React, {createContext, ForwardedRef, forwardRef, RefObject, useContext, useRef} from 'react';
import {Separator, SeparatorContext} from './Separator';
import {TextContext} from './Text';
import {useListBox, useListBoxSection, useOption} from 'react-aria';

export interface ListBoxProps<T> extends Omit<AriaListBoxProps<T>, 'children'>, CollectionProps<T>, StyleProps {
  /** How multiple selection should behave in the collection. */
  selectionBehavior?: SelectionBehavior
}

interface ListBoxContextValue<T> extends WithRef<Omit<AriaListBoxProps<T>, 'children'>, HTMLDivElement> {
  state?: ListState<T> & OverlayTriggerState
}

export const ListBoxContext = createContext<ListBoxContextValue<any>>(null);
const InternalListBoxContext = createContext<ListState<unknown>>(null);

function ListBox<T>(props: ListBoxProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  let {state} = useContext(ListBoxContext) || {};
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

/**
 * A listbox displays a list of options and allows a user to select one or more of them.
 */
const _ListBox = forwardRef(ListBox);
export {_ListBox as ListBox};

interface ListBoxInnerProps<T> {
  state: ListState<T>,
  props: ListBoxProps<T>,
  listBoxRef: RefObject<HTMLDivElement>
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
    <div
      {...listBoxProps}
      ref={listBoxRef}
      style={props.style}
      className={props.className ?? 'react-aria-ListBox'}>
      <Provider
        values={[
          [InternalListBoxContext, state],
          [SeparatorContext, {elementType: 'li'}]
        ]}>
        {children}
      </Provider>
    </div>
  );
}

interface ListBoxSectionProps<T> extends StyleProps {
  section: Node<T>
}

function ListBoxSection<T>({section, className, style}: ListBoxSectionProps<T>) {
  let {headingProps, groupProps} = useListBoxSection({
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
    <section 
      {...groupProps}
      className={className || section.props?.className || 'react-aria-Section'}
      style={style || section.props?.style}>
      {section.rendered &&
        <header {...headingProps}>
          {section.rendered}
        </header>
      }
      {children}
    </section>
  );
}

interface OptionProps<T> {
  item: Node<T>
}

function Option<T>({item}: OptionProps<T>) {
  let ref = useRef();
  let state = useContext(InternalListBoxContext);
  let {optionProps, labelProps, descriptionProps, ...states} = useOption(
    {key: item.key},
    state,
    ref
  );

  let focusVisible = states.isFocused && isFocusVisible();
  let renderProps = useRenderProps({
    className: item.props.className,
    style: item.props.style,
    children: item.rendered,
    defaultClassName: 'react-aria-Item',
    values: {
      ...states,
      isFocusVisible: focusVisible
    }
  });

  return (
    <div
      {...optionProps}
      {...renderProps}
      ref={ref}
      data-focused={states.isFocused || undefined}
      data-focus-visible={focusVisible || undefined}
      data-pressed={states.isPressed || undefined}>
      <Provider
        values={[
          [TextContext, {
            slots: {
              label: labelProps,
              description: descriptionProps
            }
          }]
        ]}>
        {renderProps.children}
      </Provider>
    </div>
  );
}
