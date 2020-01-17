import {ActionButton} from '@react-spectrum/button';
import {BreadcrumbItem} from './';
import {classNames, filterDOMProps, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {DOMProps, DOMRef} from '@react-types/shared';
import FolderBreadcrumb from '@spectrum-icons/ui/FolderBreadcrumb';
import React, {useRef} from 'react';
import {SpectrumBreadcrumbsProps} from '@react-types/breadcrumbs';
import styles from '@adobe/spectrum-css-temp/components/breadcrumb/vars.css';
import {useBreadcrumbs} from '@react-aria/breadcrumbs';
import {useBreadcrumbsState} from '@react-stately/breadcrumbs';
import {useProviderProps} from '@react-spectrum/provider';

function Breadcrumbs(props: SpectrumBreadcrumbsProps, ref: DOMRef) {
  props = useProviderProps(props);
  let {
    size = 'M',
    children,
    isHeading,
    headingAriaLevel,
    showRoot,
    isDisabled,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);

  let childArray = React.Children.toArray(children);

  let domRef = useDOMRef(ref);
  let listRef = useRef(null);

  let {visibleItems} = useBreadcrumbsState(props, listRef);

  let {breadcrumbProps} = useBreadcrumbs(props);

  if (childArray.length > visibleItems) {
    let rootItems = showRoot ? [childArray[0]] : [];

    // TODO: replace with menu component
    let menuItem = (
      <BreadcrumbItem key="menu">
        <Menu isDisabled={isDisabled}>{childArray}</Menu>
      </BreadcrumbItem>
    );
    rootItems.push(menuItem);
  
    let restItems = childArray.slice(-visibleItems + rootItems.length);

    childArray = [
      ...rootItems,
      ...restItems
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
            isHeading: isCurrent && isHeading,
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
      <ul
        ref={listRef}
        className={
          classNames(
            styles,
            'spectrum-Breadcrumbs',
            {
              'spectrum-Breadcrumbs--compact': size === 'S',
              'spectrum-Breadcrumbs--multiline': size === 'L',
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
        aria-label="…"
        icon={<FolderBreadcrumb />}
        isDisabled={isDisabled}
        isQuiet>
        {label && React.cloneElement(label, {isCurrent: undefined})}
      </ActionButton>
      <Dialog>
        {children.map((child) => React.cloneElement(child, {isCurrent: undefined}))}
      </Dialog>
    </DialogTrigger>
  );
});
