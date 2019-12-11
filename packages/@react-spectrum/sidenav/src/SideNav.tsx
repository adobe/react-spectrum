import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {CollectionBase, Expandable, SingleSelectionBase} from '@react-types/shared';
import {CollectionView} from '@react-aria/collections';
import {FocusRing} from '@react-aria/focus';
import {ListLayout, Node} from '@react-stately/collections';
import {mergeProps} from '@react-aria/utils';
import React, {AllHTMLAttributes, useMemo, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';
import {TreeState, useTreeState} from '@react-stately/tree';
import {useNav} from '@react-aria/sidenav';
import {usePress} from '@react-aria/interactions';
import {useSelectableCollection, useSelectableItem} from '@react-aria/selection';

export interface SideNavProps<T> extends CollectionBase<T>, SingleSelectionBase, Expandable {}

export function SideNav<T>(props: SideNavProps<T>) {
  let {navProps, listProps, listItemProps} = useNav(props);
  let state = useTreeState({...props, selectionMode: 'single'});

  let layout = useMemo(() => new ListLayout({rowHeight: 40}), []);

  let {listProps: selectionProps} = useSelectableCollection({
    selectionManager: state.selectionManager,
    keyboardDelegate: layout
  });

  return (
    <nav
      {...filterDOMProps(props)}
      {...navProps}
      className={classNames(styles, 'react-spectrum-SideNav')}>
      <CollectionView
        {...selectionProps}
        {...listProps}
        focusedKey={state.selectionManager.focusedKey}
        className={classNames(styles, 'spectrum-SideNav')}
        layout={layout}
        collection={state.tree}>
        {(type, item) => {
          if (type === 'section') {
            return <SideNavHeading item={item} />;
          }

          return (
            <SideNavItem
              {...listItemProps}
              state={state}
              item={item} />
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

function SideNavItem<T>({item, state, ...otherProps}: SideNavItemProps<T>) {
  let {isSelected, isDisabled, rendered} = item;
  let className = classNames(
    styles,
    'spectrum-SideNav-item',
    {
      'is-selected': isSelected,
      'is-disabled': isDisabled
    }
  );

  let ref = useRef<HTMLAnchorElement>();
  let {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    itemKey: item.key,
    itemRef: ref
  });

  let {pressProps} = usePress(itemProps);

  return (
    <div className={className}>
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
        <a
          ref={ref}
          {...mergeProps(pressProps, filterDOMProps(itemProps))}
          className={classNames(styles, 'spectrum-SideNav-itemLink')}
          role="presentation"
          {...otherProps}>
          {rendered}
        </a>
      </FocusRing>
    </div>
  );
}

interface SideNavHeadingProps<T> {
  item: Node<T>
}

function SideNavHeading<T>({item, ...otherProps}: SideNavHeadingProps<T>) {
  return (
    <h2 className={classNames(styles, 'spectrum-SideNav-heading')} {...otherProps}>
      {item.rendered}
    </h2>
  );
}
