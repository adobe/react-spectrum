import {AllHTMLAttributes} from 'react';
import {ListLayout} from '@react-stately/collections';
import {TreeState} from '@react-stately/tree';
import {useId} from '@react-aria/utils';
import {useSelectableCollection} from '@react-aria/selection';

interface SideNavAriaProps extends AllHTMLAttributes<HTMLElement>{
}

interface SideNavAria {
  navProps: AllHTMLAttributes<HTMLElement>,
  listProps: AllHTMLAttributes<HTMLUListElement>
}

export function useSideNav<T>(props: SideNavAriaProps, state: TreeState<T>, layout: ListLayout<T>): SideNavAria {
  let {hidden} = props;
  let id = useId();

  let {listProps} = useSelectableCollection({
    selectionManager: state.selectionManager,
    keyboardDelegate: layout
  });

  return {
    navProps: {
      'aria-hidden': hidden,
      'aria-label': props['aria-label'],
      'aria-labelledby': props['aria-labelledby'],
      hidden,
      role: 'navigation',
      id
    },
    listProps: {
      id: `${id}-list`,
      role: 'list',
      ...listProps
    }
  };
}
