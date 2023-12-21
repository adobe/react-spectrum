import {classNames} from '@react-spectrum/utils';
import {ListBoxItem, ListBoxItemProps} from 'react-aria-components';
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
