import {LinkRenderProps, Link as RACLink, LinkProps as RACLinkProps} from 'react-aria-components';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {StyleProps, focusRing, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {ReactNode, forwardRef} from 'react';
import {DOMRef} from '@react-types/shared';
import {useDOMRef} from '@react-spectrum/utils';

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

export interface LinkProps extends Omit<RACLinkProps, 'isDisabled' | 'className' | 'style' | 'children'>, StyleProps, LinkStyleProps {
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
  },
  disableTapHighlight: true
}, getAllowedOverrides());

function Link(props: LinkProps, ref: DOMRef<HTMLAnchorElement>) {
  let {variant = 'primary', staticColor, isQuiet, isStandalone, UNSAFE_style, UNSAFE_className = '', css} = props;

  let domRef = useDOMRef(ref);
  return (
    <RACLink
      {...props}
      ref={domRef}
      style={UNSAFE_style}
      className={renderProps => UNSAFE_className + link({...renderProps, variant, staticColor, isQuiet, isStandalone}, css)} />
  );
}

/**
 * Links allow users to navigate to a different location.
 * They can be presented inline inside a paragraph or as standalone text.
 */
const _Link = /*#__PURE__*/ forwardRef(Link);
export {_Link as Link};
