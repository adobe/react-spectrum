import {AllHTMLAttributes, useRef} from 'react';
import {BreadcrumbItemProps} from '@react-types/breadcrumbs';
import {DOMProps} from '@react-types/shared';
import {useId} from '@react-aria/utils';
import {useLink} from '@react-aria/link';

interface BreadcrumbItemAria {
  breadcrumbItemProps: AllHTMLAttributes<HTMLDivElement>
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
    ...otherProps
  } = props;

  let ref = useRef();

  let {linkProps} = useLink({children, isDisabled, ...otherProps, ref});

  let itemProps: AllHTMLAttributes<HTMLDivElement> = isCurrent
    ? {'aria-current': ariaCurrent || 'page', role: linkProps.role}
    : {...linkProps};

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
      ...breadcrumbItemHeadingProps
    }
  };
}
