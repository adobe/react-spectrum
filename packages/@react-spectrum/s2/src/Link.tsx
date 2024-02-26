import {LinkRenderProps, Link as RACLink, LinkProps as RACLinkProps} from 'react-aria-components';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {focusRing} from './style-utils' with {type: 'macro'};

interface LinkStyleProps {
  variant?: 'primary' | 'secondary',
  staticColor?: 'white' | 'black',
  isStandalone?: boolean,
  isQuiet?: boolean
}

interface LinkProps extends Omit<RACLinkProps, 'isDisabled'>, LinkStyleProps {}

export function Link(props: LinkProps) {
  let {variant = 'primary', staticColor, isQuiet, isStandalone} = props;
  return (
    <RACLink 
      {...props}
      className={renderProps => style<LinkRenderProps & LinkStyleProps>({
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
      })({...renderProps, variant, staticColor, isQuiet, isStandalone})} />
  );
}
