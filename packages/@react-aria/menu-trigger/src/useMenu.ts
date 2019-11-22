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

  return {
    menuProps: {
      ...listProps,
      ...labelProps,
      role,
      'aria-orientation': ariaOrientation
    }
  };
}
