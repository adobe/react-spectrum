import {SeparatorProps as AriaSeparatorProps, useSeparator} from 'react-aria';
import {ContextValue, SlotProps, StyleProps, useContextProps} from './utils';
import {filterDOMProps} from '@react-aria/utils';
import React, {createContext, ElementType, ForwardedRef, forwardRef} from 'react';

export interface SeparatorProps extends AriaSeparatorProps, StyleProps, SlotProps {}

export const SeparatorContext = createContext<ContextValue<SeparatorProps, Element>>({});

function Separator(props: SeparatorProps, ref: ForwardedRef<Element>) {
  [props, ref] = useContextProps(props, ref, SeparatorContext);
  let {elementType, orientation, style, className} = props;
  let Element = (elementType as ElementType) || 'hr';
  if (Element === 'hr' && orientation === 'vertical') {
    Element = 'div';
  }

  let {separatorProps} = useSeparator({
    elementType,
    orientation
  });

  return (
    <Element
      {...filterDOMProps(props)}
      {...separatorProps}
      style={style}
      className={className ?? 'react-aria-Separator'}
      ref={ref}
      slot={props.slot} />
  );
}

const _Separator = forwardRef(Separator);
export {_Separator as Separator};
