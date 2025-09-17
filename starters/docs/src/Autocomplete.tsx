'use client';
import {
  Autocomplete as AriaAutocomplete,
  AutocompleteProps as AriaAutocompleteProps,
  Key,
  useFilter
} from 'react-aria-components';
import {Menu} from './Menu';
import {SearchField} from './SearchField';

import './Autocomplete.css';

export interface AutocompleteProps<T extends object>
  extends Omit<AriaAutocompleteProps, 'children'> {
  label?: string;
  placeholder?: string;
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
  onAction?: (id: Key) => void;
  renderEmptyState?: () => React.ReactNode
}

export function Autocomplete<T extends object>(
  { label, placeholder, items, children, onAction, renderEmptyState, ...props }:
    AutocompleteProps<T>
) {
  let { contains } = useFilter({ sensitivity: 'base' });
  return (
    (
      <div className="my-autocomplete">
        <AriaAutocomplete filter={contains} {...props}>
          <SearchField label={label} placeholder={placeholder} />
          <Menu items={items} onAction={onAction} renderEmptyState={renderEmptyState}>
            {children}
          </Menu>
        </AriaAutocomplete>
      </div>
    )
  );
}
