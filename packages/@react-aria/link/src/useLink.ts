import {AllHTMLAttributes, SyntheticEvent} from 'react';
import {LinkProps} from '@react-types/link';
import {PressEvent, usePress} from '@react-aria/interactions';
import {useId} from '@react-aria/utils';

export interface AriaLinkProps extends LinkProps {
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
    tabIndex = 0,
    onPress,
    onClick: deprecatedOnClick
  } = props;

  let {pressProps}  = usePress({onPress}); 

  return {
    linkProps: {
      ...pressProps,
      id: useId(id),
      role: 'link',
      tabIndex,
      onClick: (e) => {
        if (deprecatedOnClick) {
          deprecatedOnClick(e);
          console.warn('onClick is deprecated, please use onPress');
        }
      }
    }
  };
}
