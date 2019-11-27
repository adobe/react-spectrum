import {AllHTMLAttributes} from 'react';
import {BreadcrumbItemProps} from '@react-types/breadcrumbs';
import {DOMProps} from '@react-types/shared';
import {useId} from '@react-aria/utils';
import {usePress} from '@react-aria/interactions';

interface BreadcrumbItemAria {
  breadcrumbItemProps: AllHTMLAttributes<HTMLDivElement>
}

export function useBreadcrumbItem(props: BreadcrumbItemProps & DOMProps): BreadcrumbItemAria {
  let {
    id,
    isCurrent,
    isDisabled,
    onPress
  } = props;

  let {pressProps} = usePress({onPress, isDisabled});

  let itemProps: AllHTMLAttributes<HTMLDivElement> = isCurrent
    ? {'aria-current': 'page'}
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
