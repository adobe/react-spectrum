import {ContextValue, useContextProps} from './utils';
import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes} from 'react';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  elementType?: string
}

export const TextContext = createContext<ContextValue<TextProps, HTMLElement>>({});

function Text(props: TextProps, ref: ForwardedRef<HTMLElement>) {
  [props, ref] = useContextProps(props, ref, TextContext);
  let {elementType: ElementType = 'span', ...domProps} = props;
  // @ts-ignore
  return <ElementType {...domProps} ref={ref} />;
}

const _Text = forwardRef(Text);
export {_Text as Text};
