import {AllHTMLAttributes, SyntheticEvent} from 'react';
import {DOMProps, PressEvent} from '@react-types/shared';
import {LinkProps} from '@react-types/link';
import {useId} from '@react-aria/utils';
import {usePress} from '@react-aria/interactions';

export interface AriaLinkProps extends LinkProps, DOMProps {
  href?: string,
  tabIndex?: number,
  onPress?: (e: PressEvent) => void,
  onClick?: (e: SyntheticEvent) => void
}

export interface LinkAria {
  linkProps: AllHTMLAttributes<HTMLDivElement>
}

export function useLink(props: AriaLinkProps): LinkAria {
  let {
    id,
    href,
    tabIndex = 0,
    children,
    onPress,
    onClick: deprecatedOnClick
  } = props;

  let linkProps;
  if (typeof children === 'string') {
    linkProps = {
      role: 'link',
      tabIndex
    };
  }

  if (href) {
    console.warn('href is deprecated, please use an anchor element as children');
  }

  let {pressProps} = usePress({onPress}); 

  return {
    linkProps: {
      ...pressProps,
      ...linkProps,
      id: useId(id),
      onClick: (e) => {
        if (deprecatedOnClick) {
          deprecatedOnClick(e);
          console.warn('onClick is deprecated, please use onPress');
        }
      }
    }
  };
}
