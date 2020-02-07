import {AllHTMLAttributes} from 'react';
import {ListLayout} from '@react-stately/collections';
import {TreeState} from '@react-stately/tree';
import {useId} from '@react-aria/utils';
import {useSelectableCollection} from '@react-aria/selection';

interface SideNavAriaProps extends AllHTMLAttributes<HTMLElement>{
}

interface SideNavAria {
  navProps: AllHTMLAttributes<HTMLDivElement>,
  listProps: AllHTMLAttributes<HTMLUListElement>
}

export function useSideNav<T>(props: SideNavAriaProps, state: TreeState<T>, layout: ListLayout<T>): SideNavAria {
  let {
    id,
    hidden,
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
      'aria-hidden': hidden,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabeldBy,
      hidden,
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
