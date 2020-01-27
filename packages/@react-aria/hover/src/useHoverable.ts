import {HoverEvents} from '@react-types/shared';
import {mergeProps} from '@react-aria/utils';
import {RefObject} from 'react';
import {useHover} from '@react-aria/interactions';
import {filterDOMProps} from '@react-spectrum/utils';

interface HoverableProps extends HoverEvents {
  isDisabled?: boolean
}

export function useHoverable(props?: HoverableProps, domRef?: RefObject<HTMLElement>) {
  let {hoverProps} = useHover(props, domRef);

  return {
    ...filterDOMProps(hoverProps)
  };
}
