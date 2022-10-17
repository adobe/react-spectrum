import {SeparatorProps as AriaSeparatorProps, useSeparator} from 'react-aria';
import {filterDOMProps} from '@react-aria/utils';
import React, {createContext, ElementType, ForwardedRef, forwardRef} from 'react';
import {StyleProps, useContextProps} from './utils';

export interface SeparatorProps extends AriaSeparatorProps, StyleProps {}

export const SeparatorContext = createContext<SeparatorProps>({});

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
      ref={ref} />
  );
}

const _Separator = forwardRef(Separator);
export {_Separator as Separator};
