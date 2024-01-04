import {classNames} from '@react-spectrum/utils';
import {ListBoxItem, ListBoxItemProps, MenuItem, MenuItemProps} from 'react-aria-components';
import React from 'react';
import styles from '../example/index.css';

export const MyListBoxItem = (props: ListBoxItemProps) => {
  return (
    <ListBoxItem
      {...props}
      className={({isFocused, isSelected, isHovered}) => classNames(styles, 'item', {
        focused: isFocused,
        selected: isSelected,
        hovered: isHovered
      })} />
  );
};

export const MyMenuItem = (props: MenuItemProps) => {
  return (
    <MenuItem
      {...props}
      className={({isFocused, isSelected}) => classNames(styles, 'item', {
        focused: isFocused,
        selected: isSelected
      })} />
  );
};
