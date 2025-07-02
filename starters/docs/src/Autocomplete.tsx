'use client';
import {
  Autocomplete as AriaAutocomplete,
  AutocompleteProps as AriaAutocompleteProps,
  Key,
  Menu,
  useFilter
} from 'react-aria-components';

import {MySearchField} from './SearchField';

import './Autocomplete.css';

export interface AutocompleteProps<T extends object>
  extends Omit<AriaAutocompleteProps, 'children'> {
  label?: string;
  placeholder?: string;
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
  onAction?: (id: Key) => void;
}

export function Autocomplete<T extends object>(
  { label, placeholder, items, children, onAction, ...props }:
    AutocompleteProps<T>
) {
  let { contains } = useFilter({ sensitivity: 'base' });
  return (
    (
      <div className="my-autocomplete">
        <AriaAutocomplete filter={contains} {...props}>
          <MySearchField label={label} placeholder={placeholder} />
          <Menu items={items} onAction={onAction}>
            {children}
          </Menu>
        </AriaAutocomplete>
      </div>
    )
  );
}
