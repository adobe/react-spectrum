import {AllHTMLAttributes} from 'react';
import {useId} from '@react-aria/utils';

interface SideNavProps extends AllHTMLAttributes<HTMLElement>{
}

interface SideNavAria {
  navProps: AllHTMLAttributes<HTMLElement>,
  listProps: AllHTMLAttributes<HTMLUListElement>,
  listItemProps: AllHTMLAttributes<HTMLLIElement>
}

export function useNav(props: SideNavProps): SideNavAria {
  let {hidden} = props;
  let id = useId();

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
      id: `${id}-list`
    },
    listItemProps: {
      hidden,
      role: 'link',
      target: '_self'
    }
  };
}
