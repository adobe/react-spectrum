import {AllHTMLAttributes, RefObject} from 'react';
import {mergeProps} from '@react-aria/utils';
import {Node} from '@react-stately/collections';
import {TreeState} from '@react-stately/tree';
import {usePress} from '@react-aria/interactions';
import {useSelectableItem} from '@react-aria/selection';

interface SideNavItemAriaProps<T> extends AllHTMLAttributes<HTMLElement>{
  item: Node<T>
}

interface SideNavItemAria {
  listItemProps: AllHTMLAttributes<HTMLDivElement>,
  listItemLinkProps: AllHTMLAttributes<HTMLAnchorElement>
}

export function useSideNavItem<T>(props: SideNavItemAriaProps<T>, state: TreeState<T>, ref: RefObject<HTMLAnchorElement | null>): SideNavItemAria {
  let {
    item,
    'aria-current': ariaCurrent
  } = props;

  let {itemProps} = useSelectableItem({
    selectionManager: state.selectionManager,
    itemKey: item.key,
    itemRef: ref
  });

  let {pressProps} = usePress({...itemProps, isDisabled: item.isDisabled});

  return {
    listItemProps: {
      role: 'listitem'
    },
    listItemLinkProps: {
      role: 'link',
      target: '_self',
      'aria-disabled': item.isDisabled,
      'aria-current': item.isSelected ? ariaCurrent || 'page' : undefined,
      ...mergeProps(itemProps, pressProps)
    }
  };
}
