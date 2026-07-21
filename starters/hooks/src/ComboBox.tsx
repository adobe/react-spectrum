'use client';
import {useComboBox} from 'react-aria/useComboBox';
import {useFilter} from 'react-aria/useFilter';
import {
  useComboBoxState,
  type ComboBoxProps as StatelyComboBoxProps
} from 'react-stately/useComboBoxState';
import {CollectionBuilder} from 'react-aria/CollectionBuilder';
import type {Collection as ICollection, Node} from '@react-types/shared';
import {Provider} from 'react-aria-components/slots';
import {ComboBoxStateContext} from 'react-aria-components/ComboBox';
import {Collection} from 'react-aria-components/Collection';
import {Label, LabelContext} from 'react-aria-components/Label';
import {Button, ButtonContext} from 'react-aria-components/Button';
import {Input, InputContext} from 'react-aria-components/Input';
import {OverlayTriggerStateContext} from 'react-aria-components/Dialog';
import {Popover, PopoverContext} from 'react-aria-components/Popover';
import {ListBoxContext, ListStateContext} from 'react-aria-components/ListBox';
import {ChevronDown} from 'lucide-react';
import {useRef} from 'react';
import type {ReactNode} from 'react';
import {DropdownItem, DropdownListBox} from './DropdownListBox';
import './ComboBox.css';
import './Form.css';
import './ListBox.css';
import './Popover.css';

export {DropdownItem as ComboBoxItem};

export type ComboBoxProps = StatelyComboBoxProps<object> & {label?: ReactNode};

export function ComboBox(props: ComboBoxProps) {
  return (
    <CollectionBuilder content={<Collection {...props} />}>
      {collection => <ComboBoxInner {...props} collection={collection} />}
    </CollectionBuilder>
  );
}

function ComboBoxInner({
  collection,
  ...props
}: StatelyComboBoxProps<object> & {
  collection: ICollection<Node<object>>;
  label?: ReactNode;
}) {
  let {contains} = useFilter({sensitivity: 'base'});
  let state = useComboBoxState({
    ...props,
    defaultFilter: contains,
    collection,
    children: undefined
  });
  let fieldRef = useRef<HTMLDivElement>(null);
  let inputRef = useRef<HTMLInputElement>(null);
  let buttonRef = useRef<HTMLButtonElement>(null);
  let listBoxRef = useRef<HTMLDivElement>(null);
  let popoverRef = useRef<HTMLDivElement>(null);
  let {labelProps, inputProps, buttonProps, listBoxProps} = useComboBox(
    {...props, inputRef, buttonRef, listBoxRef, popoverRef},
    state
  );

  return (
    <Provider
      values={[
        [ComboBoxStateContext, state],
        [LabelContext, labelProps],
        [ButtonContext, {...buttonProps, ref: buttonRef, isPressed: state.isOpen}],
        [InputContext, {...inputProps, ref: inputRef}],
        [OverlayTriggerStateContext, state],
        [
          PopoverContext,
          {
            ref: popoverRef,
            triggerRef: fieldRef,
            scrollRef: listBoxRef,
            trigger: 'ComboBox',
            placement: 'bottom start',
            isNonModal: true
          }
        ],
        [ListBoxContext, {...listBoxProps, ref: listBoxRef}],
        [ListStateContext, state]
      ]}>
      <div className="react-aria-ComboBox">
        <Label>{props.label}</Label>
        <div className="combobox-field" ref={fieldRef}>
          <Input className="react-aria-Input inset" />
          <Button className="field-Button">
            <ChevronDown />
          </Button>
        </div>
        <Popover className="react-aria-Popover combobox-popover">
          <DropdownListBox />
        </Popover>
      </div>
    </Provider>
  );
}
