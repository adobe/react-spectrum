import {AriaSelectProps} from '@react-types/select';
import {ButtonContext} from './Button';
import {createContext, HTMLAttributes, ReactNode, useCallback, useContext, useRef, useState} from 'react';
import {HiddenSelect, useSelect} from 'react-aria';
import {LabelContext} from './Label';
import {ListBoxContext, ListBoxProps} from './ListBox';
import {PopoverContext} from './Popover';
import {Provider, RenderProps, slotCallbackSymbol, useRenderProps, useSlot} from './utils';
import React from 'react';
import {SelectState, useSelectState} from 'react-stately';
import {useCollection} from './Collection';
import {useResizeObserver} from '@react-aria/utils';

interface SelectProps<T extends object> extends Omit<AriaSelectProps<T>, 'children' | 'label'>, RenderProps<SelectState<T>> {}

interface SelectValueContext {
  state: SelectState<unknown>,
  valueProps: HTMLAttributes<HTMLElement>
}

const SelectContext = createContext<SelectValueContext>(null);

export function Select<T extends object>(props: SelectProps<T>) {
  let [listBoxProps, setListBoxProps] = useState<ListBoxProps<any>>({children: []});

  let {portal, collection} = useCollection({
    items: props.items ?? listBoxProps.items,
    children: listBoxProps.children
  });
  let state = useSelectState({
    ...props,
    collection,
    children: null
  });

  // Get props for child elements from useSelect
  let ref = useRef<HTMLButtonElement>(null);
  let [labelRef, label] = useSlot();
  let {
    labelProps,
    triggerProps,
    valueProps,
    menuProps
  } = useSelect({...props, label}, state, ref);

  // Make menu width match input + button
  let [buttonWidth, setButtonWidth] = useState(null);
  let onResize = useCallback(() => {
    if (ref.current) {
      setButtonWidth(ref.current.offsetWidth + 'px');
    }
  }, [ref]);

  useResizeObserver({
    ref,
    onResize: onResize
  });

  let renderProps = useRenderProps({
    ...props,
    values: state,
    defaultClassName: 'react-aria-Select'
  });

  return (
    <Provider
      values={[
        [SelectContext, {state, valueProps}],
        [LabelContext, {...labelProps, ref: labelRef, elementType: 'span'}],
        [ButtonContext, {...triggerProps, ref, isPressed: state.isOpen}],
        [PopoverContext, {
          state,
          triggerRef: ref,
          preserveChildren: true,
          placement: 'bottom start',
          style: {'--button-width': buttonWidth} as React.CSSProperties
        }],
        [ListBoxContext, {state, [slotCallbackSymbol]: setListBoxProps, ...menuProps}]
      ]}>
      <div {...renderProps}>
        {props.children}
      </div>
      {portal}
      <HiddenSelect
        state={state}
        triggerRef={ref}
        label={label}
        name={props.name} />
    </Provider>
  );
}

export interface SelectValueRenderProps {
  /**
   * Whether the value is a placeholder.
   * @selector [data-placeholder]
   */
  isPlaceholder: boolean,
  /** The rendered value of the currently selected item. */
  selectedItem: ReactNode
}

interface SelectValueProps extends Omit<HTMLAttributes<HTMLElement>, keyof RenderProps<unknown>>, RenderProps<SelectValueRenderProps> {}

export function SelectValue(props: SelectValueProps) {
  let {state, valueProps} = useContext(SelectContext);
  let renderProps = useRenderProps({
    ...props,
    defaultChildren: state.selectedItem?.rendered || 'Select an item',
    defaultClassName: 'react-aria-SelectValue',
    values: {
      selectedItem: state.selectedItem?.rendered,
      isPlaceholder: !state.selectedItem
    }
  });

  return (
    <span {...valueProps} {...renderProps} data-placeholder={!state.selectedItem || undefined} />
  );
}
