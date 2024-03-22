import {style} from '../style/spectrum-theme' with { type: 'macro' };
import {DOMRef, DOMProps} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import React, {forwardRef} from 'react';
import {StyleProps, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';

export interface AvatarProps extends StyleProps, DOMProps {
  /** Text description of the avatar. */
  alt?: string,
  /** The image URL for the avatar. */
  src?: string
}

const imageStyles = style({
  borderRadius: 'full',
  size: 20,
  disableTapHighlight: true
}, getAllowedOverrides({height: true}));

function Avatar(props: AvatarProps, ref: DOMRef<HTMLImageElement>) {
  let {
    alt = '',
    src,
    UNSAFE_style,
    UNSAFE_className = '',
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  const domProps = filterDOMProps(otherProps);

  return (
    <img
      {...domProps}
      ref={domRef}
      alt={alt}
      style={{...UNSAFE_style}}
      className={UNSAFE_className + imageStyles(null, props.css)}
      src={src} />
  );
}

/**
 * An avatar is a thumbnail representation of an entity, such as a user or an organization.
 */
let _Avatar = forwardRef(Avatar);
export {_Avatar as Avatar};
