'use client';
import {HiddenSelect, useSelect} from 'react-aria/useSelect';
import {useSelectState, type SelectProps} from 'react-stately/useSelectState';
import {CollectionBuilder} from 'react-aria/CollectionBuilder';
import type {Collection as ICollection, Node} from '@react-types/shared';
import {Provider} from 'react-aria-components/slots';
import {
  SelectContext,
  SelectValue,
  SelectStateContext,
  SelectValueContext
} from 'react-aria-components/Select';
import {Collection} from 'react-aria-components/Collection';
import {Label, LabelContext} from 'react-aria-components/Label';
import {Button, ButtonContext} from 'react-aria-components/Button';
import {OverlayTriggerStateContext} from 'react-aria-components/Dialog';
import {Popover, PopoverContext} from 'react-aria-components/Popover';
import {ListBoxContext, ListStateContext} from 'react-aria-components/ListBox';
import {ChevronDown} from 'lucide-react';
import {useRef} from 'react';
import type {ReactNode} from 'react';
import {DropdownItem, DropdownListBox} from './DropdownListBox';
import './Button.css';
import './Form.css';
import './ListBox.css';
import './Popover.css';
import './Select.css';

export {DropdownItem as SelectItem};

export function Select(props: SelectProps<object> & {label?: ReactNode}) {
  return (
    <CollectionBuilder content={<Collection {...props} />}>
      {collection => <SelectInner {...props} collection={collection} />}
    </CollectionBuilder>
  );
}

function SelectInner({
  collection,
  ...props
}: SelectProps<object> & {
  collection: ICollection<Node<object>>;
  label?: ReactNode;
}) {
  let state = useSelectState({...props, collection, children: undefined});
  let buttonRef = useRef<HTMLButtonElement>(null);
  let scrollRef = useRef<HTMLDivElement>(null);
  let {labelProps, triggerProps, valueProps, menuProps, hiddenSelectProps} = useSelect(
    props,
    state,
    buttonRef
  );

  return (
    <Provider
      values={[
        [SelectContext, {placeholder: props.placeholder}],
        [SelectStateContext, state],
        [SelectValueContext, valueProps],
        [LabelContext, {...labelProps, elementType: 'span'}],
        [ButtonContext, {...triggerProps, ref: buttonRef, isPressed: state.isOpen}],
        [OverlayTriggerStateContext, state],
        [
          PopoverContext,
          {trigger: 'Select', triggerRef: buttonRef, scrollRef, placement: 'bottom start'}
        ],
        [ListBoxContext, {...menuProps, ref: scrollRef}],
        [ListStateContext, state]
      ]}>
      <div className="react-aria-Select">
        <Label>{props.label}</Label>
        <Button className="react-aria-Button button-base" data-variant="primary">
          <SelectValue />
          <ChevronDown />
        </Button>
        <HiddenSelect {...hiddenSelectProps} />
        <Popover className="react-aria-Popover select-popover">
          <DropdownListBox />
        </Popover>
      </div>
    </Provider>
  );
}
