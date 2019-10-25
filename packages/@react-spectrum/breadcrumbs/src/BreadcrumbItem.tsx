import {BreadcrumbItemProps} from '@react-types/breadcrumbs';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import React, {RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/breadcrumb/vars.css';
import {useBreadcrumbItem} from '@react-aria/breadcrumbs';

export const BreadcrumbItem = React.forwardRef((props: BreadcrumbItemProps, ref: RefObject<HTMLElement>) => {
  let {
    children,
    className,
    ...otherProps
  } = props;

  let {breadcrumbItemProps} = useBreadcrumbItem(props);

  let element;
  if (typeof children === 'string') {
    element = <span>{children}</span>;
  } else {
    element = React.Children.only(children);
  }

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      {React.cloneElement(element, {
        ...filterDOMProps(otherProps),
        ...breadcrumbItemProps,
        ref,
        className:
          classNames(
            styles,
            'spectrum-Breadcrumbs-itemLink',
            className
          )
      })}
    </FocusRing>
  );
});
