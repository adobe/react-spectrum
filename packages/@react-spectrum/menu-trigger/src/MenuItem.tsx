import {classNames, filterDOMProps} from '@react-spectrum/utils';
import CheckmarkMedium from '@spectrum-icons/ui/CheckmarkMedium';
import {FocusRing} from '@react-aria/focus';
import {MenuContext} from './context';
import {mergeProps, useId} from '@react-aria/utils';
import {Node} from '@react-stately/collections';
import React, {useContext, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {TreeState} from '@react-stately/tree'; 
import {usePress} from '@react-aria/interactions';
import {useSelectableItem} from '@react-aria/selection';

interface MenuItemProps<T> {
  item: Node<T>,
  state: TreeState<T>
}

// For now export just to see what it looks like, remove after
// Placeholder for now, Rob's pull will make the real menuItem
// How would we get MenuItem user specified props in?
export function MenuItem<T>({item, state}: MenuItemProps<T>) {
  let menuProps = useContext(MenuContext) || {};
  let {
    rendered,
    isSelected,
    isDisabled
  } = item;
  
  // TODO: All of the below should be in a useMenuItem aria hook, to be handled in MenuItem pull
  // The hook should also setup behavior on Enter/Space etc, overriding/merging with the above itemProps returned by useSelectableItem  
  let ref = useRef<HTMLDivElement>();
  let {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    itemKey: item.key,
    itemRef: ref
  });

  let menuItemProps = {
    'aria-disabled': isDisabled,
    ref,
    id: useId(),     
    role: 'menuitem'
  };

  if (menuProps.role === 'listbox') {
    menuItemProps.role = 'option';
    menuItemProps['aria-selected'] = isSelected ? 'true' : 'false';
  } else if (menuProps.selectionMode === 'single') {
    menuItemProps.role = 'menuitemradio';
    menuItemProps['aria-checked'] = isSelected ? 'true' : 'false';
  } else if (menuProps.selectionMode === 'multiple') {
    menuItemProps.role = 'menuitemcheckbox';
    menuItemProps['aria-checked'] = isSelected ? 'true' : 'false';
  }

  let onKeyDown = (e) => {
    let role = menuItemProps.role;

    switch (e.key) {
      case ' ':
        if (!isDisabled) {
          if (role !== 'menuitemcheckbox' && role !== 'menuitemradio' && role !== 'option') {
            menuProps.setOpen && menuProps.setOpen(false);
          }
        }
        break;
      case 'Enter':
        if (!isDisabled) {
          menuProps.setOpen && menuProps.setOpen(false);
        }
        break;
    }
  }; 

  let onPress = (e) => {
    if (e.pointerType !== 'keyboard') {
      menuProps.setOpen && menuProps.setOpen(false);
    }
  };

  let onMouseOver = () => state.selectionManager.setFocusedKey(item.key);
  // Note: the ref below is needed so that a menuItem with children serves as a MenuTrigger properly
  // Add it if we like that behavior but remove if/when we make a subMenu item/trigger component
  // let {pressProps} = usePress(mergeProps({onPressStart}, {...itemProps, ref}));

  // The below allows the user to properly cycle through all choices via up/down arrow (suppresses up and down from triggering submenus by not including the ref). 
  // isDisabled suppresses sub menu triggers from firing
  let {pressProps} = usePress(mergeProps({onPress}, mergeProps({onKeyDown}, {...itemProps, isDisabled: isDisabled})));

  // Will need additional aria-owns and stuff when submenus are finalized
  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <div
        {...mergeProps(pressProps, filterDOMProps(itemProps))}
        {...menuItemProps}
        onMouseOver={onMouseOver}
        onFocus={() => {}}
        className={classNames(
          styles,
          'spectrum-Menu-item',
          {
            'is-disabled': isDisabled,
            'is-selected': isSelected
          }
        )}>
        <span
          className={classNames(
            styles,
            'spectrum-Menu-itemLabel')}>
          {rendered}
        </span>
        {isSelected && <CheckmarkMedium  UNSAFE_className={classNames(styles, 'spectrum-Menu-checkmark')} />}
      </div>
    </FocusRing>
  );
}
