import {LinkRenderProps, Link as RACLink, LinkProps as RACLinkProps} from 'react-aria-components';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {StyleProps, focusRing, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {ReactNode} from 'react';

interface LinkStyleProps {
  variant?: 'primary' | 'secondary',
  staticColor?: 'white' | 'black',
  isStandalone?: boolean,
  isQuiet?: boolean
}

interface LinkProps extends Omit<RACLinkProps, 'isDisabled' | 'className' | 'style' | 'children'>, StyleProps, LinkStyleProps {
  children?: ReactNode
}

const link = style<LinkRenderProps & LinkStyleProps>({
  ...focusRing(),
  borderRadius: 'sm',
  color: {
    variant: {
      primary: 'accent',
      secondary: 'neutral' // TODO: should there be an option to inherit from the paragraph? What about hover states?
    },
    staticColor: {
      white: 'white',
      black: 'black'
    },
    forcedColors: 'LinkText'
  },
  transition: 'default',
  fontFamily: {
    isStandalone: 'sans'
  },
  fontWeight: {
    isStandalone: 'medium'
  },
  fontSize: {
    isStandalone: 'base'
  },
  textDecoration: {
    default: 'underline',
    isStandalone: {
      // Inline links must always have an underline for accessibility.
      isQuiet: {
        default: 'none',
        isHovered: 'underline',
        isFocusVisible: 'underline'
      }
    }
  },
  outlineColor: {
    default: 'focus-ring',
    staticColor: {
      white: 'white',
      black: 'black'
    },
    forcedColors: 'Highlight'
  }
}, getAllowedOverrides());

export function Link(props: LinkProps) {
  let {variant = 'primary', staticColor, isQuiet, isStandalone, UNSAFE_style, UNSAFE_className = '', css} = props;
  return (
    <RACLink 
      {...props}
      style={UNSAFE_style}
      className={renderProps => UNSAFE_className + link({...renderProps, variant, staticColor, isQuiet, isStandalone}, css)} />
  );
}
