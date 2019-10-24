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

  let {breadcrumbProps} = useBreadcrumbs(props);

  let childArray = React.Children.toArray(children);
  let isCurrent = (i) => (
    i === childArray.length - 1
  );

  let isMultiline = size === 'L'; 

  return (
    <nav
      {...filterDOMProps(otherProps)}
      {...breadcrumbProps}
      ref={ref} >
      <ul
        className={classNames(
          styles,
          'spectrum-Breadcrumbs',
          {
            'spectrum-Breadcrumbs--compact': size === 'S',
            'spectrum-Breadcrumbs--multiline': isMultiline
          },
          className)}>
        {childArray.map((child, i) => (
          <li
            key={`spectrum-Breadcrumb-${i}`}
            className={classNames(
              styles,
              'spectrum-Breadcrumbs-item'
            )}>
            {
              isCurrent(i) && isMultiline ?
                <h1 
                  className={classNames(
                    styles,
                    'spectrum-Heading--pageTitle'
                    )}
                  aria-level={headingAriaLevel}>
                  {React.cloneElement(child, {isCurrent: isCurrent(i)})}
                </h1>
                : React.cloneElement(child, {isCurrent: isCurrent(i)})
            }
            {!isCurrent(i) &&
              <ChevronRightSmall
                className={classNames(
                styles,
                'spectrum-Breadcrumbs-itemSeparator')} />
            }
          </li>
        ))}
      </ul>
    </nav>
  );
});
