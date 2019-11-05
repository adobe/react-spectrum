import {ActionButton} from '@react-spectrum/button';
import {BreadcrumbItem} from './';
import {BreadcrumbsProps} from '@react-types/breadcrumbs';
import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {DOMProps} from '@react-types/shared';
import FolderBreadcrumb from '@spectrum-icons/ui/FolderBreadcrumb';
import {HTMLElement} from 'react-dom';
import React, {RefObject, useEffect, useRef, useState} from 'react';
import styles from '@adobe/spectrum-css-temp/components/breadcrumb/vars.css';
import {useBreadcrumbs} from '@react-aria/breadcrumbs';

export interface SpectrumBreadcrumbsProps extends BreadcrumbsProps {
  size?: 'S' | 'M' | 'L',
  headingAriaLevel?: number,
  showRoot?: boolean,
  isDisabled?: boolean,
  maxVisibleItems?: 'auto' | number
}

export const Breadcrumbs = React.forwardRef((props: SpectrumBreadcrumbsProps, ref: RefObject<HTMLElement>) => {
  let {
    className,
    size = 'M',
    children,
    headingAriaLevel,
    showRoot,
    isDisabled,
    maxVisibleItems = 4,
    ...otherProps
  } = props;

  let isCollapisble = maxVisibleItems === 'auto';
  let childArray = React.Children.toArray(children);

  const [hidden, setHidden] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    let onResize = () => {
      if (isCollapisble) {
        setHidden(listRef.current.scrollWidth > listRef.current.offsetWidth);
      }
    };

    window.addEventListener('resize', onResize);
    onResize();
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [isCollapisble]);

  let {breadcrumbProps} = useBreadcrumbs(props);

  if (!isCollapisble && childArray.length > maxVisibleItems) {
    let rootItems = showRoot ? [childArray[0]] : [];

    // TODO: replace with menu component
    let menuItem = (
      <BreadcrumbItem>
        <Menu isDisabled={isDisabled}>{childArray}</Menu>
      </BreadcrumbItem>
    );
    rootItems.push(menuItem);

    let visibleItems = childArray.slice(-maxVisibleItems + rootItems.length);

    childArray = [
      ...rootItems,
      ...visibleItems
    ];
  }

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
        {React.cloneElement(
          child,
          {
            isCurrent,
            isHeading: size === 'L',
            headingAriaLevel,
            isDisabled
          }
        )}
      </li>
    );
  });

  // TODO: replace menu with select
  return (
    <nav
      {...filterDOMProps(otherProps)}
      {...breadcrumbProps}
      ref={ref} >
      {
        hidden &&
        <div
          className={
            classNames(
              styles,
              'spectrum-Breadcrumbs-dropdown'
            )
          }>
          <Menu label={childArray[lastIndex]} isDisabled={isDisabled}>
            {childArray}
          </Menu>
        </div>
      }
      <ul
        ref={listRef}
        data-testid="breadcrumb-list"
        className={
          classNames(
            styles,
            'spectrum-Breadcrumbs',
            {
              'spectrum-Breadcrumbs--compact': size === 'S',
              'spectrum-Breadcrumbs--multiline': size === 'L',
              'is-hidden': hidden,
              'is-disabled': isDisabled
            },
            className
          )
        }>
        {breadcrumbItems}
      </ul>
    </nav>
  );
});

// temporary replacement for menu and select component
interface MenuProps extends DOMProps {
  label?: any,
  isDisabled?: boolean,
  children?: any
}

const Menu = React.forwardRef((props: MenuProps) => {
  let {
    children,
    label = '',
    isDisabled
  } = props;

  return (
    <DialogTrigger type="popover">
      <ActionButton
        icon={<FolderBreadcrumb />}
        isDisabled={isDisabled}
        isQuiet >
        {label && React.cloneElement(label, {isCurrent: true})}
      </ActionButton>
      <Dialog>
        {children.map((child) => React.cloneElement(child, {isCurrent: true}))}
      </Dialog>
    </DialogTrigger>
  );
});
