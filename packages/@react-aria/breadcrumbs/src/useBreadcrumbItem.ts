import {AllHTMLAttributes} from 'react';
import {BreadcrumbItemProps} from '@react-types/breadcrumbs';
import {useId} from '@react-aria/utils';
import {usePress} from '@react-aria/interactions';

interface BreadcrumbItemAria {
  breadcrumbItemProps: AllHTMLAttributes<HTMLDivElement>
}

export function useBreadcrumbItem(props: BreadcrumbItemProps): BreadcrumbItemAria {
  let {
    id,
    isCurrent,
    'aria-current': ariaCurrent,
    onPress
  } = props;

  let {pressProps} = usePress({onPress}); 

  let itemProps = isCurrent
    ? {'aria-current': ariaCurrent || 'page'}
    : {...pressProps, tabIndex: 0};

  return {
    breadcrumbItemProps: {
      id: useId(id),
      ...itemProps
    }
  };
}
