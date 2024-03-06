import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {CenterBaseline} from './CenterBaseline';
import {createContext, ForwardedRef, ReactElement, cloneElement, forwardRef} from 'react';
import {ContextValue} from './Content';
import {SlotProps, useContextProps} from 'react-aria-components';
import {StyleProps, getAllowedOverrides} from './style-utils' with {type: 'macro'};

interface IconProps extends StyleProps, SlotProps {
  children: ReactElement
}

export const IconContext = createContext<ContextValue<Partial<IconProps>, HTMLImageElement>>({});
export interface IconPropsWithoutChildren extends Omit<IconProps, 'children'> {}

const styles = style({marginStart: '--iconMargin', flexShrink: 0}, getAllowedOverrides());

function Icon(props: IconProps, ref: ForwardedRef<HTMLImageElement>) {
  [props, ref] = useContextProps(props, ref, IconContext);
  return (
    <CenterBaseline slot="icon" style={props.UNSAFE_style} className={props.UNSAFE_className + styles(null, props.css)}>
      {cloneElement(props.children, {
        className: style({
          fill: 'currentColor',
          size: '[calc(20 / 14 * 1em)]'
        })
      })}
    </CenterBaseline>
  );
}

const _Icon = forwardRef(Icon);
export {_Icon as Icon};
