import {ActionButton} from '@react-spectrum/button';
import {BreadcrumbItem} from './';
import {BreadcrumbsProps} from '@react-types/breadcrumbs';
import {classNames, DOMRef, filterDOMProps, useDOMRef} from '@react-spectrum/utils';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {DOMProps} from '@react-types/shared';
import FolderBreadcrumb from '@spectrum-icons/ui/FolderBreadcrumb';
import React, {useEffect, useState} from 'react';
import {StyleProps, useStyleProps} from '@react-spectrum/view';
import styles from '@adobe/spectrum-css-temp/components/breadcrumb/vars.css';
import {useBreadcrumbs} from '@react-aria/breadcrumbs';

export interface SpectrumBreadcrumbsProps extends BreadcrumbsProps, DOMProps, StyleProps {
  size?: 'S' | 'M' | 'L',
  headingAriaLevel?: number,
  showRoot?: boolean,
  isDisabled?: boolean,
  maxVisibleItems?: 'auto' | number
}

function Breadcrumbs(props: SpectrumBreadcrumbsProps, ref: DOMRef) {
  let {
    size = 'M',
    children,
    headingAriaLevel,
    showRoot,
    isDisabled,
    maxVisibleItems = 4,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);

  let isCollapsible = maxVisibleItems === 'auto';
  let childArray = React.Children.toArray(children);

  const [hidden, setHidden] = useState(false);
  let domRef = useDOMRef(ref);

  useEffect(() => {
    let onResize = () => {
      if (isCollapsible && domRef.current) {
        setHidden(domRef.current.scrollWidth > domRef.current.offsetWidth);
      }
    };

    window.addEventListener('resize', onResize);
    onResize();
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [domRef, isCollapsible]);

  let {breadcrumbProps} = useBreadcrumbs(props);

  if (!isCollapsible && childArray.length > maxVisibleItems) {
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
            isHeading: isCurrent && size === 'L',
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
      {...styleProps}
      {...breadcrumbProps}
      ref={domRef}>
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
            styleProps.className
          )
        }>
        {breadcrumbItems}
      </ul>
    </nav>
  );
}

let _Breadcrumbs = React.forwardRef(Breadcrumbs);
export {_Breadcrumbs as Breadcrumbs};

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
