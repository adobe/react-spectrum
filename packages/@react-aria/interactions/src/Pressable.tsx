import {mergeProps} from '@react-aria/utils';
import {PressProps, usePress} from './usePress';
import React, {HTMLAttributes, ReactElement, RefObject, useRef} from 'react';

interface PressableProps extends PressProps {
  children: ReactElement<HTMLAttributes<HTMLElement>, string>
}

export const Pressable = React.forwardRef(({children, ...props}: PressableProps, ref: RefObject<HTMLElement>) => {
  ref = ref || useRef();
  let {pressProps} = usePress({...props, ref});
  let child = React.Children.only(children);
  return React.cloneElement(
    child,
    // @ts-ignore
    {ref, ...mergeProps(child.props, pressProps)}
  );
});
