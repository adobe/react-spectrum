import {AriaComboBoxProps} from '@react-types/combobox';
import {ButtonContext} from './Button';
import {CollectionBase} from '@react-types/shared';
import {InputContext} from './Input';
import {LabelContext} from './Label';
import {ListBoxContext} from './ListBox';
import {PopoverContext} from './Popover';
import {Provider} from './utils';
import React, {ReactNode, useRef, useState} from 'react';
import {useCollection} from './Collection';
import {useComboBox, useFilter} from 'react-aria';
import {useComboBoxState} from 'react-stately';

interface ComboBoxProps<T extends object> extends Omit<AriaComboBoxProps<T>, 'children'> {
  children: ReactNode
}

export function ComboBox<T extends object>(props: ComboBoxProps<T>) {
  let [propsFromListBox, setListBoxProps] = useState<CollectionBase<any>>({children: []});

  let {contains} = useFilter({sensitivity: 'base'});
  let {portal, collection} = useCollection(propsFromListBox);
  let state = useComboBoxState({
    defaultFilter: contains,
    ...props,
    items: propsFromListBox ? props.items : [],
    children: () => {},
    collection
  });

  let buttonRef = useRef(null);
  let inputRef = useRef(null);
  let listBoxRef = useRef(null);
  let popoverRef = useRef(null);
  let {
    buttonProps,
    inputProps,
    listBoxProps,
    labelProps
  } = useComboBox({
    ...props,
    label: 'f',
    inputRef,
    buttonRef,
    listBoxRef,
    popoverRef
  },
  state);

  return (
    <Provider
      values={[
        [LabelContext, labelProps],
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
