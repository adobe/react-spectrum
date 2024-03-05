import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {CSSProperties, createContext, ForwardedRef, ReactElement, cloneElement, forwardRef} from 'react';
import {CenterBaseline} from './CenterBaseline';
import {mergeStyles} from '../style-macro/runtime';
import {ContextValue} from './Content';
import {SlotProps, useContextProps} from 'react-aria-components';

interface IconStyleProps extends SlotProps {
  className?: string,
  style?: CSSProperties
}

interface IconProps extends IconStyleProps {
  children: ReactElement
}

export const IconContext = createContext<ContextValue<IconStyleProps, HTMLImageElement>>({});
export interface IconPropsWithoutChildren extends Omit<IconProps, 'children'> {}

function Icon(props: IconProps, ref: ForwardedRef<HTMLImageElement>) {
  [props, ref] = useContextProps(props, ref, IconContext);
  return (
    <CenterBaseline slot="icon" className={mergeStyles(style({marginStart: '--iconMargin', flexShrink: 0})(), props.className)}>
      {cloneElement(props.children, {
        className: style({
          fill: 'currentColor',
          size: '[calc(20 / 14 * 1em)]'
        })()
      })}
    </CenterBaseline>
  );
}

const _Icon = forwardRef(Icon);
export {_Icon as Icon};
