import {AllHTMLAttributes} from 'react';
import {CollectionBase, DOMProps, Expandable, MultipleSelection} from '@react-types/shared';
import {ListLayout} from '@react-stately/collections';
import {TreeState} from '@react-stately/tree';
import {useLabels} from '@react-aria/utils';
import {useSelectableCollection} from '@react-aria/selection';

type orientation = 'vertical' | 'horizontal'

interface MenuAria {
  menuProps: AllHTMLAttributes<HTMLElement>
}

interface MenuState<T> extends TreeState<T> {}

interface MenuLayout<T> extends ListLayout<T> {}

export function useMenu<T>(props: CollectionBase<T> & Expandable & MultipleSelection & DOMProps, state: MenuState<T>, layout: MenuLayout<T>): MenuAria {
  let {
    'aria-orientation': ariaOrientation = 'vertical' as orientation,
    role = 'menu'
  } = props;
   
  let labelProps = useLabels(props);

  let {listProps} = useSelectableCollection({
    selectionManager: state.selectionManager,
    keyboardDelegate: layout
  });

  // other stuff to come? stuff like keyboard interactions?
  // Enter, Space, Down/Up Arrow (handled in Devon's pull), Right/Left arrow etc
  // See https://github.com/adobe/react-spectrum-v3/blob/master/specs/accessibility/Menu.mdx#keyboard-interaction
  // Need to figure out how to override some of the keyboard actions provided by useSelectableCollection and useSelectableItem

  return {
    menuProps: {
      ...listProps,
      ...labelProps,
      role,
      'aria-orientation': ariaOrientation
    }
  };
}
