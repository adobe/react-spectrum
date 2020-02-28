import {AllHTMLAttributes, Key, ReactElement, RefObject} from 'react';
import {CollectionBase, DOMProps, Expandable, MultipleSelection, Orientation, StyleProps} from '@react-types/shared';
import {Node} from '@react-stately/collections';
import {TreeState} from '@react-stately/tree';

export type FocusStrategy = 'first' | 'last';

export interface MenuTriggerState {
  isOpen: boolean,
  setOpen: (value: boolean) => void,
  focusStrategy: FocusStrategy,
  setFocusStrategy: (value: FocusStrategy) => void
}

export interface MenuTriggerProps {
  ref?: RefObject<HTMLElement | null>,
  type?: 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid',
  isDisabled?: boolean
} 

export interface SpectrumMenuTriggerProps extends MenuTriggerProps {
  children: ReactElement[],
  trigger?: 'press' | 'longPress',
  align?: 'start' | 'end',
  direction?: 'bottom' | 'top', // left right?
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void,
  shouldFlip?: boolean,
  closeOnSelect?: boolean
}

export interface MenuProps<T> extends CollectionBase<T>, Expandable, MultipleSelection, DOMProps, StyleProps {
  'aria-orientation'?: Orientation,
  autoFocus?: boolean,
  focusStrategy?: FocusStrategy,
  wrapAround?: boolean
}

export interface SpectrumMenuProps<T> extends MenuProps<T> {
}

export interface MenuItemProps<T> {
  isDisabled?: boolean,
  isSelected?: boolean,
  key?: Key,
  role?: string
}

export interface SpectrumMenuItemProps<T> extends AllHTMLAttributes<HTMLElement> {
  item: Node<T>,
  state: TreeState<T>
}

export interface SpectrumMenuHeadingProps<T> {
  item: Node<T>
}
