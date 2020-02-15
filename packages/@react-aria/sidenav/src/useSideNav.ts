import {AllHTMLAttributes} from 'react';
import {CollectionBase, DOMProps, Expandable, SingleSelection} from '@react-types/shared';
import {ListLayout} from '@react-stately/collections';
import {TreeState} from '@react-stately/tree';
import {useId} from '@react-aria/utils';
import {useSelectableCollection} from '@react-aria/selection';

interface SideNavAriaProps<T> extends CollectionBase<T>, Expandable, SingleSelection, DOMProps {}

interface SideNavAria {
  navProps: AllHTMLAttributes<HTMLDivElement>,
  listProps: AllHTMLAttributes<HTMLUListElement>
}

export function useSideNav<T>(props: SideNavAriaProps<T>, state: TreeState<T>, layout: ListLayout<T>): SideNavAria {
  let {
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabeldBy
  } = props;

  id = useId(id);

  let {listProps} = useSelectableCollection({
    selectionManager: state.selectionManager,
    keyboardDelegate: layout
  });

  return {
    navProps: {
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabeldBy,
      role: 'navigation',
      id
    },
    listProps: {
      'aria-labelledby': ariaLabeldBy || (ariaLabel ? id : null),
      role: 'list',
      ...listProps
    }
  };
}
