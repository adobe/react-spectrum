import {HoverProps, useHover} from './useHover';
import {mergeProps} from '@react-aria/utils';
import React, {HTMLAttributes, ReactElement, RefObject, useRef} from 'react';

interface HoverableProps extends HoverProps {
  children: ReactElement<HTMLAttributes<HTMLElement>, string>
}

export const Hoverable = React.forwardRef(({children, ...props}: HoverableProps, ref: RefObject<HTMLElement>) => {
  ref = ref || useRef();
  let {hoverProps} = useHover({...props, ref});
  let child = React.Children.only(children);
  return React.cloneElement(
    child,
    // @ts-ignore
    {ref, ...mergeProps(child.props, hoverProps)}
  );
});
