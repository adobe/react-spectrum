import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {CollectionBase, Expandable, SingleSelectionBase} from '@react-types/shared';
import {CollectionView} from '@react-aria/collections';
import {FocusRing} from '@react-aria/focus';
import {ListLayout, Node} from '@react-stately/collections';
import React, {AllHTMLAttributes, useMemo, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';
import {TreeState, useTreeState} from '@react-stately/tree';
import {useSideNav, useSideNavItem} from '@react-aria/sidenav';

export interface SideNavProps<T> extends CollectionBase<T>, SingleSelectionBase, Expandable {}

export function SideNav<T>(props: SideNavProps<T>) {
  let state = useTreeState({...props, selectionMode: 'single', disableEmptySelection: true});

  let layout = useMemo(() => new ListLayout({rowHeight: 40}), []);

  let {navProps, listProps} = useSideNav(props, state, layout);

  return (
    <nav
      {...filterDOMProps(props)}
      {...navProps}
      className={classNames(styles, 'react-spectrum-SideNav')}>
      <CollectionView
        {...listProps}
        focusedKey={state.selectionManager.focusedKey}
        className={classNames(styles, 'spectrum-SideNav')}
        layout={layout}
        collection={state.tree}>
        {(type, item) => {
          if (type === 'section') {
            return (
              <SideNavHeading
                item={item}
                id={`${navProps.id}-heading${item.key}`} />
            );
          }

          return (
            <SideNavItem
              state={state}
              item={item}
              id={`${navProps.id}-listitem${item.key}`} />
          );
        }}
      </CollectionView>
    </nav>
  );
}

interface SideNavItemProps<T> extends AllHTMLAttributes<HTMLElement>{
  item: Node<T>,
  state: TreeState<T>
}

function SideNavItem<T>(props: SideNavItemProps<T>) {
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

interface SideNavHeadingProps<T> extends AllHTMLAttributes<HTMLElement> {
  item: Node<T>
}

function SideNavHeading<T>({item, ...otherProps}: SideNavHeadingProps<T>) {
  let ref = useRef<HTMLHeadingElement>();

  return (
    <h2
      {...otherProps}
      ref={ref}
      className={classNames(styles, 'spectrum-SideNav-heading')} >
      {item.rendered}
    </h2>
  );
}
