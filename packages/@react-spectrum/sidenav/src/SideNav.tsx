import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {CollectionBase, Expandable, SingleSelectionBase} from '@react-types/shared';
import {CollectionView} from '@react-aria/collections';
import {ListLayout, Node} from '@react-stately/collections';
import React, {AllHTMLAttributes, useMemo} from 'react';
import styles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';
import {useNav} from '@react-aria/sidenav';
import {useProviderProps} from '@react-spectrum/provider';
import {useTreeState} from '@react-stately/tree';

export interface SideNavProps<T> extends CollectionBase<T>, SingleSelectionBase, Expandable {}

export function SideNav<T>(props: SideNavProps<T>) {
  let completeProps = Object.assign({}, useProviderProps(props));
  let {navProps, listProps, listItemProps} = useNav(completeProps);
  let {
    tree: navigation,
    onToggle,
    onSelectToggle
  } = useTreeState(props);

  let layout = useMemo(() => new ListLayout({rowHeight: 40}), []);

  return (
    <nav
      {...filterDOMProps(completeProps)}
      {...navProps}
      className={classNames(styles, 'react-spectrum-SideNav')}>
      <CollectionView
        {...listProps}
        className={classNames(styles, 'spectrum-SideNav')}
        layout={layout}
        collection={navigation}>
        {(type, item) => {
          if (type === 'section') {
            return <SideNavHeading item={item} />;
          }

          return (
            <SideNavItem
              {...listItemProps}
              onToggle={onToggle}
              onSelectToggle={onSelectToggle}
              item={item} />
          );
        }}
      </CollectionView>
    </nav>
  );
}

interface SideNavItemProps<T> extends AllHTMLAttributes<HTMLElement>{
  item: Node<T>,
  onToggle: (item: Node<T>) => void, // only for multi level
  onSelectToggle: (item: Node<T>) => void
}
function SideNavItem<T>({item, onSelectToggle, ...otherProps}: SideNavItemProps<T>) {
  let {isSelected, isDisabled, rendered} = item;
  let {className, ...other} = otherProps;
  className = classNames(
    styles,
    'spectrum-SideNav-itemLink',
    {
      'is-selected': isSelected,
      'is-disabled': isDisabled
    },
    className
  );
  // TODO: How to handle icon prop that existed in v2 SideNavItem?
  return (
    <div className={classNames(styles, 'spectrum-SideNav-item')}>
      <a
        className={className}
        role="presentation"
        onClick={() => onSelectToggle(item)}
        {...other}>
        {rendered}
      </a>
    </div>
  );
}

function SideNavHeading({item, ...otherProps}) {
  return (
    <h2 className={classNames(styles, 'spectrum-SideNav-heading')} {...otherProps}>
      {item.rendered}
    </h2>
  );
}
