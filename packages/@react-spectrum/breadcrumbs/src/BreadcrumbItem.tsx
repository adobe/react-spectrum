import {BreadcrumbItemProps} from '@react-types/breadcrumbs';
import ChevronRightSmall from '@spectrum-icons/ui/ChevronRightSmall';
import {classNames, filterDOMProps, getWrappedElement} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import React, {Fragment, RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/breadcrumb/vars.css';
import {useBreadcrumbItem} from '@react-aria/breadcrumbs';
import {useLocale} from '@react-aria/i18n';

export const BreadcrumbItem = React.forwardRef((props: BreadcrumbItemProps, ref: RefObject<HTMLElement>) => {
  let {
    children,
    isHeading,
    isCurrent,
    isDisabled,
  ...otherProps
  } = props;

  let {direction} = useLocale();
  let {breadcrumbItemProps, breadcrumbItemHeadingProps} = useBreadcrumbItem(props);

  let element = React.cloneElement(
    getWrappedElement(children),
    {
      ...filterDOMProps(otherProps),
      ...breadcrumbItemProps,
      ref,
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
        {
          isHeading ?
            <span
              {...breadcrumbItemHeadingProps}
              className={
                classNames(
                  styles,
                  'spectrum-Heading--pageTitle'
                )
              }>
              {element}
            </span>
            : element
        }
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
});
