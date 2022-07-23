import {createContext, useContext} from 'react';
import { mergeProps } from 'react-aria';

export const HeadingContext = createContext({});

export function Heading({children, style, className, ...otherProps}) {
  let headingProps = useContext(HeadingContext);
  let {level, ...domProps} = mergeProps(headingProps, otherProps);
  let Element = `h${level || 3}`;

  return (
    <Element {...domProps} style={style} className={className}>
      {children}
    </Element>
  );
}
