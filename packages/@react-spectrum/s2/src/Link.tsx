import {LinkRenderProps, Link as RACLink, LinkProps as RACLinkProps} from 'react-aria-components';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {StyleProps, focusRing, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {ReactNode} from 'react';

interface LinkStyleProps {
  /**
   * The [visual style](https://spectrum.adobe.com/page/link/#Options) of the link.
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary',
  /** The static color style to apply. Useful when the link appears over a color background. */
  staticColor?: 'white' | 'black',
  /** Whether the link is on its own vs inside a longer string of text. */
  isStandalone?: boolean,
  /** Whether the link should be displayed with a quiet style. */
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
    isStandalone: 'ui'
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
