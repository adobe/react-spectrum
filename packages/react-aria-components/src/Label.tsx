import {ContextValue, useContextProps} from './utils';
import React, {createContext, ForwardedRef, forwardRef, LabelHTMLAttributes} from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  elementType?: string
}

export const LabelContext = createContext<ContextValue<LabelProps, HTMLLabelElement>>({});

function Label(props: LabelProps, ref: ForwardedRef<HTMLLabelElement>) {
  [props, ref] = useContextProps(props, ref, LabelContext);
  let {elementType: ElementType = 'label', ...labelProps} = props;
  // @ts-ignore
  return <ElementType className="react-aria-Label" {...labelProps} ref={ref} />;
}

const _Label = forwardRef(Label);
export {_Label as Label};
