import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes} from 'react';
import {useContextProps, WithRef} from './utils';

export interface HeadingProps extends HTMLAttributes<HTMLElement> {
  level?: number
}

export const HeadingContext = createContext<WithRef<HeadingProps, HTMLHeadingElement>>({});

function Heading(props: HeadingProps, ref: ForwardedRef<HTMLHeadingElement>) {
  [props, ref] = useContextProps(props, ref, HeadingContext);
  let {children, level = 3, ...domProps} = props;
  let Element = `h${level}`;

  return (
    <Element {...domProps}>
      {children}
    </Element>
  );
}

const _Heading = forwardRef(Heading);
export {_Heading as Heading};
