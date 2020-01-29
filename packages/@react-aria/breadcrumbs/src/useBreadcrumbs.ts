import {AllHTMLAttributes} from 'react';
import {BreadcrumbsProps} from '@react-types/breadcrumbs';
import {BreadcrumbsState} from '@react-stately/breadcrumbs';
import {DOMProps} from '@react-types/shared';
import intlMessages from '../intl/*.json';
import {RefObject, useEffect} from 'react';
import {useId} from '@react-aria/utils';
import {useMessageFormatter} from '@react-aria/i18n';

interface BreadcrumbsAria {
  breadcrumbProps: AllHTMLAttributes<HTMLDivElement>
}

export function useBreadcrumbs(props: BreadcrumbsProps & DOMProps, state: BreadcrumbsState, ref: RefObject<HTMLUListElement>): BreadcrumbsAria {
  let {
    id,
    'aria-label': ariaLabel,
    maxVisibleItems
  } = props;

  let {
    setVisibleItems
  } = state;

  useEffect(() => {
    let childrenArray = Array.from(ref.current.children);
    let childrenWidthTotals = childrenArray.reduce((acc, item, index) => (
      [...acc, acc[index] + item.getBoundingClientRect().width]
    ), [0]);

    let onResize = () => {
      if (maxVisibleItems === 'auto' && ref.current) {
        let containerWidth = ref.current.getBoundingClientRect().width;
        setVisibleItems(childrenWidthTotals, containerWidth);
      }
    };

    window.addEventListener('resize', onResize);
    onResize();
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [ref, setVisibleItems, maxVisibleItems]);

  let formatMessage = useMessageFormatter(intlMessages);
  return {
    breadcrumbProps: {
      id: useId(id),
      'aria-label': ariaLabel || formatMessage('breadcrumbs')
    }
  };
}
