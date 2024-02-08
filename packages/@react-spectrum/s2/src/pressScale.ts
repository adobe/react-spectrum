import {CSSProperties, RefObject} from 'react';
import {composeRenderProps} from 'react-aria-components';

export function pressScale<R extends {isPressed: boolean}>(ref: RefObject<HTMLElement>, style?: CSSProperties | ((renderProps: R) => CSSProperties)) {
  return composeRenderProps(style, (style, renderProps: R) => {
    if (renderProps.isPressed && ref.current) {
      let {width = 0, height = 0} = ref.current.getBoundingClientRect() ?? {};      
      return {
        ...style,
        willChange: `${style?.willChange ?? ''} transform`,
        transform: `${style?.transform ?? ''} perspective(${Math.max(height, width / 3, 24)}px) translate3d(0, 0, -2px)`
      };
    } else {
      return {
        ...style,
        willChange: `${style?.willChange ?? ''} transform`
      };
    }
  });
}
