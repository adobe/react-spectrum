import {AriaComboBoxProps} from '@react-types/combobox';
import {ButtonContext} from './Button';
import {InputContext} from './Input';
import {LabelContext} from './Label';
import {ListBoxContext, ListBoxProps} from './ListBox';
import {PopoverContext} from './Popover';
import {Provider, useSlot} from './utils';
import React, {ReactNode, useRef, useState} from 'react';
import {useCollection} from './Collection';
import {useComboBox, useFilter} from 'react-aria';
import {useComboBoxState} from 'react-stately';

interface ComboBoxProps<T extends object> extends Omit<AriaComboBoxProps<T>, 'children' | 'placeholder' | 'name' | 'label'> {
  children: ReactNode
}

export function ComboBox<T extends object>(props: ComboBoxProps<T>) {
  let [propsFromListBox, setListBoxProps] = useState<ListBoxProps<any>>({children: []});

  let {contains} = useFilter({sensitivity: 'base'});
  let {portal, collection} = useCollection({
    items: props.items ?? props.defaultItems ?? propsFromListBox.items,
    children: propsFromListBox.children
  });
  let state = useComboBoxState({
    defaultFilter: contains,
    ...props,
    items: propsFromListBox ? (props.items ?? propsFromListBox.items) : [],
    children: () => {},
    collection
  });

  let buttonRef = useRef(null);
  let inputRef = useRef(null);
  let listBoxRef = useRef(null);
  let popoverRef = useRef(null);
  let [labelRef, label] = useSlot();
  let {
    buttonProps,
    inputProps,
    listBoxProps,
    labelProps
  } = useComboBox({
    ...props,
    label,
    inputRef,
    buttonRef,
    listBoxRef,
    popoverRef
  },
  state);

  return (
    <Provider
      values={[
        [LabelContext, {...labelProps, ref: labelRef}],
        [ButtonContext, {...buttonProps, ref: buttonRef}],
        [InputContext, {...inputProps, ref: inputRef}],
        [PopoverContext, {state, ref: popoverRef, triggerRef: inputRef, placement: 'bottom start', preserveChildren: true, isNonModal: true}],
        [ListBoxContext, {state, setListBoxProps, ...listBoxProps, ref: listBoxRef}]
      ]}>
      {props.children}
      {portal}
    </Provider>
  );
}
