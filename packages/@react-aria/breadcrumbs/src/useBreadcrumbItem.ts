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
    isDisabled,
    'aria-current': ariaCurrent,
    onPress
  } = props;

  let {pressProps} = usePress({onPress, isDisabled}); 


  let itemProps = isCurrent
    ? {'aria-current': ariaCurrent || 'page'}
    : {...pressProps};

  return {
    breadcrumbItemProps: {
      id: useId(id),
      tabIndex: isDisabled || isCurrent ? -1 : 0,
      'aria-disabled': isDisabled,
      ...itemProps
    }
  };
}
