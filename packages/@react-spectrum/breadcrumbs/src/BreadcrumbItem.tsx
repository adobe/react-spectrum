import {BreadcrumbItemProps} from '@react-types/breadcrumbs';
import ChevronRightSmall from '@spectrum-icons/ui/ChevronRightSmall';
import {classNames, filterDOMProps, getWrappedElement} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import React, {Fragment} from 'react';
import styles from '@adobe/spectrum-css-temp/components/breadcrumb/vars.css';
import {useBreadcrumbItem} from '@react-aria/breadcrumbs';
import {useLocale} from '@react-aria/i18n';

export function BreadcrumbItem(props: BreadcrumbItemProps) {
  let {
    children,
    isCurrent,
    isDisabled,
  ...otherProps
  } = props;

  let {direction} = useLocale();
  let {breadcrumbItemProps} = useBreadcrumbItem(props);

  let element = React.cloneElement(
    getWrappedElement(children),
    {
      ...filterDOMProps(otherProps),
      ...breadcrumbItemProps,
      className:
        classNames(
          styles,
          'spectrum-Breadcrumbs-itemLink',
          {
            'is-disabled': !isCurrent && isDisabled
          }
        )
    }
  );

  return (
    <Fragment>
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
        {element}
      </FocusRing>
      {isCurrent === false &&
        <ChevronRightSmall
          className={
            classNames(
              styles,
              'spectrum-Breadcrumbs-itemSeparator',
              {
                'is-reversed': direction === 'rtl'
              }
            )
          } />
      }
    </Fragment>
  );
}
