import {AllHTMLAttributes} from 'react';
import {BreadcrumbsProps} from '@react-types/breadcrumbs';
import intlMessages from '../intl/*.json';
import {useId} from '@react-aria/utils';
import {useMessageFormatter} from '@react-aria/i18n';

interface BreadcrumbsAria {
  breadcrumbProps: AllHTMLAttributes<HTMLDivElement>
}

export function useBreadcrumbs(props: BreadcrumbsProps): BreadcrumbsAria {
  let {
    id,
    'aria-label': ariaLabel
  } = props;

  let formatMessage = useMessageFormatter(intlMessages);
  return {
    breadcrumbProps: {
      id: useId(id),
      'aria-label': ariaLabel || formatMessage('breadcrumbs')
    }
  };
}
