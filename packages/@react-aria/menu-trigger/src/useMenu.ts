import {AllHTMLAttributes} from 'react';
import {CollectionBase, DOMProps, Expandable, MultipleSelection} from '@react-types/shared';
import {useLabels} from '@react-aria/utils';

type orientation = 'vertical' | 'horizontal'

interface MenuAria {
  menuProps: AllHTMLAttributes<HTMLElement>
}

export function useMenu<T>(props: CollectionBase<T> & Expandable & MultipleSelection & DOMProps): MenuAria {
  let {
    'aria-orientation': ariaOrientation = 'vertical' as orientation,
    role = 'menu'
  } = props;
   
  let labelProps = useLabels(props);

  // other stuff to come? stuff like keyboard interactions?
  // Enter, Space, Down/Up Arrow (handled in Devon's pull), Right/Left arrow etc
  // See https://github.com/adobe/react-spectrum-v3/blob/master/specs/accessibility/Menu.mdx#keyboard-interaction

  return {
    menuProps: {
      ...labelProps,
      role,
      'aria-orientation': ariaOrientation
    }
  };
}
