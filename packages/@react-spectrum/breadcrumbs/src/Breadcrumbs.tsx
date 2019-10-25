import {BreadcrumbsProps} from '@react-types/breadcrumbs';
import ChevronRightSmall from '@spectrum-icons/ui/ChevronRightSmall';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {RefObject} from 'react';
import styles from '@adobe/spectrum-css-temp/components/breadcrumb/vars.css';
import {useBreadcrumbs} from '@react-aria/breadcrumbs';

export interface SpectrumBreadcrumbsProps extends BreadcrumbsProps {
  size?: 'S' | 'M' | 'L',
  headingAriaLevel?: number
}

export const Breadcrumbs = React.forwardRef((props: SpectrumBreadcrumbsProps, ref: RefObject<HTMLElement>) => {
  let {
    className,
    size = 'M',
    children,
    headingAriaLevel,
    ...otherProps
  } = props;

  let isMultiline = size === 'L'; 

  let {breadcrumbProps} = useBreadcrumbs(props);

  let childArray = React.Children.toArray(children);
  let lastIndex = childArray.length - 1;
  let breadcrumbItems = childArray.map((child, index) => {
    let isCurrent = index === lastIndex;
    return (
      <li
        key={child.key}
        className={
          classNames(
            styles,
            'spectrum-Breadcrumbs-item'
          )
        }>
        {
          isCurrent && isMultiline ?
            <h1 
              className={
                classNames(
                  styles,
                  'spectrum-Heading--pageTitle'
                )
              }
              aria-level={headingAriaLevel}>
              {React.cloneElement(child, {isCurrent})}
            </h1>
            : React.cloneElement(child, {isCurrent})
        }
        {!isCurrent &&
          <ChevronRightSmall
            className={
              classNames(
                styles,
                'spectrum-Breadcrumbs-itemSeparator'
              )
            } />
        }
      </li>
    );
  });

  return (
    <nav
      {...filterDOMProps(otherProps)}
      {...breadcrumbProps}
      ref={ref} >
      <ul
        className={
          classNames(
            styles,
            'spectrum-Breadcrumbs',
            {
              'spectrum-Breadcrumbs--compact': size === 'S',
              'spectrum-Breadcrumbs--multiline': isMultiline
            },
            className
          )
        }>
        {breadcrumbItems}
      </ul>
    </nav>
  );
});
