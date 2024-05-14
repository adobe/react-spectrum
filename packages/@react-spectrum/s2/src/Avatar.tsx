import {style} from '../style/spectrum-theme' with { type: 'macro' };
import {DOMRef, DOMProps} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import {createContext, forwardRef} from 'react';
import {StylesPropWithHeight, StyleProps, UnsafeStyles, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {ContextValue, useContextProps} from 'react-aria-components';

export interface AvatarProps extends StyleProps, DOMProps {
  /** Text description of the avatar. */
  alt?: string,
  /** The image URL for the avatar. */
  src?: string
}

export interface AvatarContextProps extends UnsafeStyles, DOMProps {
  /** Text description of the avatar. */
  alt?: string,
  /** The image URL for the avatar. */
  src?: string,
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight
}

const imageStyles = style({
  borderRadius: 'full',
  size: 20,
  disableTapHighlight: true
}, getAllowedOverrides({height: true}));

export const AvatarContext = createContext<ContextValue<AvatarContextProps, HTMLImageElement>>({});

function Avatar(props: AvatarProps, ref: DOMRef<HTMLImageElement>) {
  let domRef = useDOMRef(ref);
  [props, domRef] = useContextProps(props, domRef, AvatarContext);
  let {
    alt = '',
    src,
    UNSAFE_style,
    UNSAFE_className = '',
    ...otherProps
  } = props;
  const domProps = filterDOMProps(otherProps);

  return (
    <img
      {...domProps}
      ref={domRef}
      alt={alt}
      style={UNSAFE_style}
      className={UNSAFE_className + imageStyles(null, props.styles)}
      src={src} />
  );
}

/**
 * An avatar is a thumbnail representation of an entity, such as a user or an organization.
 */
let _Avatar = forwardRef(Avatar);
export {_Avatar as Avatar};
