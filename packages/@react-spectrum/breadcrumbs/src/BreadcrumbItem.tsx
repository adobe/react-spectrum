import {BreadcrumbItemProps} from '@react-types/breadcrumbs';
import ChevronRightSmall from '@spectrum-icons/ui/ChevronRightSmall';
import {classNames, filterDOMProps, getWrappedElement} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import React, {Fragment, RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/breadcrumb/vars.css';
import {useBreadcrumbItem} from '@react-aria/breadcrumbs';

export const BreadcrumbItem = React.forwardRef((props: BreadcrumbItemProps, ref: RefObject<HTMLElement>) => {
  let {
    children,
    className,
    isHeading,
    isCurrent,
    isDisabled,
    headingAriaLevel,
    ...otherProps
  } = props;

  let {breadcrumbItemProps} = useBreadcrumbItem(props);

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
          },
          className
        )
    }
  );

  return (
    <Fragment>
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
        {
          isHeading ?
            <h1 
              className={
                classNames(
                  styles,
                  'spectrum-Heading--pageTitle'
                )
              }
              aria-level={headingAriaLevel}>
              {element}
            </h1>
            : element
        }
      </FocusRing>
      {!isCurrent &&
        <ChevronRightSmall
          className={
            classNames(
              styles,
              'spectrum-Breadcrumbs-itemSeparator'
            )
          } />
      }
    </Fragment>
  );
});
