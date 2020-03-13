import {classNames} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {Node} from '@react-stately/collections';
import React, {useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';
import {TreeState} from '@react-stately/tree';
import {useSideNavItem} from '@react-aria/sidenav';

interface SideNavItemProps<T> {
  item: Node<T>,
  state: TreeState<T>
}

export function SideNavItem<T>(props: SideNavItemProps<T>) {
  let ref = useRef<HTMLAnchorElement>();
  let {
    isSelected,
    isDisabled,
    rendered
  } = props.item;

  let className = classNames(
    styles,
    'spectrum-SideNav-item',
    {
      'is-selected': isSelected,
      'is-disabled': isDisabled
    }
  );

  let {listItemProps, listItemLinkProps} = useSideNavItem(props, props.state, ref);

  return (
    <div
      {...listItemProps}
      className={className} >
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
        <a
          {...listItemLinkProps}
          ref={ref}
          className={classNames(styles, 'spectrum-SideNav-itemLink')} >
          {rendered}
        </a>
      </FocusRing>
    </div>
  );
}
