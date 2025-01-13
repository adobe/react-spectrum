import {UNSTABLE_Autocomplete as Autocomplete, Input, Label, Menu, MenuItem, SearchField, Text, useFilter} from 'react-aria-components'
import {classNames} from '@react-spectrum/utils';
import styles from './autocomplete.css';

interface AutocompleteItem {
  id: string,
  name: string
}

let items: AutocompleteItem[] = [{id: '1', name: 'Foo'}, {id: '2', name: 'Bar'}, {id: '3', name: 'Baz'}];

export function AutocompleteExample() {
  let {contains} = useFilter({sensitivity: 'base'});

  return (
    <Autocomplete filter={contains}>
      <div>
        <SearchField autoFocus>
          <Label style={{display: 'block'}}>Test</Label>
          <Input />
          <Text style={{display: 'block'}} slot="description">Please select an option below.</Text>
        </SearchField>
        <Menu items={items} selectionMode="single">
          {item => (
            <MenuItem
              id={item.id}
              className={({isFocused, isSelected, isOpen}) => classNames(styles, 'item', {
                focused: isFocused,
                selected: isSelected,
                open: isOpen
              })}>
              {item.name}
            </MenuItem>
          )}
        </Menu>
      </div>
    </Autocomplete>
  );
}
