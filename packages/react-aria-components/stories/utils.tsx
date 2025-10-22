import {classNames} from '@react-spectrum/utils';
import {ListBoxItem, ListBoxItemProps, MenuItem, MenuItemProps, ProgressBar} from 'react-aria-components';
import React, {JSX} from 'react';
import styles from '../example/index.css';

export const MyListBoxItem = (props: ListBoxItemProps): JSX.Element => {
  return (
    <ListBoxItem
      {...props}
      style={{wordBreak: 'break-word', ...props.style}}
      className={({isFocused, isSelected, isHovered, isFocusVisible}) => classNames(styles, 'item', {
        focused: isFocused,
        selected: isSelected,
        hovered: isHovered,
        focusVisible: isFocusVisible
      })} />
  );
};

export const MyMenuItem = (props: MenuItemProps): JSX.Element => {
  return (
    <MenuItem
      {...props}
      className={({isFocused, isSelected, isOpen, isFocusVisible}) => classNames(styles, 'item', {
        focused: isFocused,
        selected: isSelected,
        open: isOpen,
        focusVisible: isFocusVisible
      })} />
  );
};

export const LoadingSpinner = ({style = {}}: {style?: React.CSSProperties}): JSX.Element => {
  return (
    <ProgressBar
      aria-label="loading"
      isIndeterminate
      style={style}
      className={styles['spinner']}>
      <svg height="100%" width="100%" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25" />
        <path fill="currentColor" d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z">
          <animateTransform attributeName="transform" type="rotate" dur="0.75s" values="0 12 12;360 12 12" repeatCount="indefinite" />
        </path>
      </svg>
    </ProgressBar>
  );
};
