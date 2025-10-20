'use client';
import {
  Autocomplete as AriaAutocomplete,
  AutocompleteProps as AriaAutocompleteProps,
  MenuProps as AriaMenuProps,
  useFilter,
  Dialog
} from 'react-aria-components';
import {Menu} from './Menu';
import {SearchField} from './SearchField';
import {Modal} from './Modal';
import React, {useEffect} from 'react';

export interface CommandPaletteProps<T extends object> extends Omit<AriaAutocompleteProps, 'children'>, AriaMenuProps<T> {
  isOpen: boolean,
  onOpenChange: (isOpen?: boolean) => void
}

export function CommandPalette<T extends object>(props: CommandPaletteProps<T>) {
  let {isOpen, onOpenChange} = props;
  let {contains} = useFilter({sensitivity: 'base'});

  useEffect(() => {
    let isMacUA = /mac(os|intosh)/i.test(navigator.userAgent);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'j' && (isMacUA ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onOpenChange]);

  return (
    <Modal isDismissable isOpen={isOpen} onOpenChange={onOpenChange}>
      <Dialog>
        <AriaAutocomplete filter={contains} {...props}>
          <SearchField
            autoFocus
            aria-label="Search commands"
            placeholder="Search commands"
            className="m-2" />
          <Menu
            {...props}
            renderEmptyState={() => 'No results found.'} />
        </AriaAutocomplete>
      </Dialog>
    </Modal>
  );
}
