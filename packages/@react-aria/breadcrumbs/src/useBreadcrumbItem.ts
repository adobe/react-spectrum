import {AllHTMLAttributes} from 'react';
import {BreadcrumbItemProps} from '@react-types/breadcrumbs';
import {DOMProps} from '@react-types/shared';
import {useId} from '@react-aria/utils';
import {usePress} from '@react-aria/interactions';

interface BreadcrumbItemAria {
  breadcrumbItemProps: AllHTMLAttributes<HTMLDivElement>,
  breadcrumbItemHeadingProps: AllHTMLAttributes<HTMLDivElement>
}

export function useBreadcrumbItem(props: BreadcrumbItemProps & DOMProps): BreadcrumbItemAria {
  let {
    id,
    isCurrent,
    isDisabled,
    isHeading,
    headingAriaLevel = 1,
    children = '',
    'aria-current': ariaCurrent,
    onPress
  } = props;

  let {pressProps} = usePress({onPress, isDisabled});

  let itemProps: AllHTMLAttributes<HTMLDivElement> = isCurrent
    ? {'aria-current': ariaCurrent || 'page'}
    : {...pressProps};

  let linkProps;
  if (typeof children === 'string') {
    linkProps = {
      role: 'link',
      tabIndex: isDisabled || isCurrent ? -1 : 0
    };
  }

  let breadcrumbItemHeadingProps;
  if (isHeading && isCurrent) {
    breadcrumbItemHeadingProps = {
      role: 'heading',
      'aria-level': headingAriaLevel
    };
  }

  return {
    breadcrumbItemProps: {
      id: useId(id),
      'aria-disabled': isDisabled,
      ...itemProps,
      ...linkProps
    },
    breadcrumbItemHeadingProps
  };
}
