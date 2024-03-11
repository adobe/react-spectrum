import {size, style} from '../style-macro/spectrum-theme' with { type: 'macro' };
import {DOMRef} from '@react-types/shared';
import {forwardRef} from 'react';
import {StyleProps, getAllowedOverrides} from './style-utils' with {type: 'macro'};

import ColorAvatar from '../avatars/avatar_color_16';
import DatasetsAvatar from '../avatars/avatar_datasets_16';
import LassoAvatar from '../avatars/avatar_lasso_16';
import MagicWandAvatar from '../avatars/avatar_magicWand_16';
import PaintBucketAvatar from '../avatars/avatar_paintBucket_16';
import PenAvatar from '../avatars/avatar_pen_16';
import PencilAvatar from '../avatars/avatar_pencil_16';
import ScissorAvatar from '../avatars/avatar_scissors_16';
import SelectionAvatar from '../avatars/avatar_selection_16';
import StampAvatar from '../avatars/avatar_stamp_16';
import ZoomAvatar from '../avatars/avatar_zoom_16';
import LayersAvatar from '../avatars/avatar_layers_16';

enum GenericAvatarSvg {
  color = 'color',
  datasets = 'datasets',
  lasso = 'lasso',
  layers = 'layers',
  magicWand = 'magicWand',
  paintBucket = 'paintBucket',
  pen = 'pen',
  pencil = 'pencil',
  scissors = 'scissors',
  selection = 'selection',
  stamp = 'stamp',
  zoom = 'zoom'
}

export interface AvatarProps extends StyleProps {
  generic?: GenericAvatarSvg,
  isDisabled?: boolean,
  size?: 16 | 18 | 20 | 22 | 26 | 28 | 32 | 36 | 40,
  alt?: string,
  src?: string
}

const imageStyles = style({
  borderRadius: 'full',
  size: {
    default: 20,
    size: {
      // TODO: do we need these sizes? Can we just have a default one and allow size overrides via the css prop?
      16: 16,
      18: size(18),
      22: size(22),
      26: size(26),
      28: 28,
      32: 32,
      36: 36,
      40: 40
    }
  },
  opacity: {
    isDisabled: .3
  }
}, getAllowedOverrides());

// TODO - Need feedback on if they are open sourced and how they should be hosted
let genericAvatars = {
  [GenericAvatarSvg.color]: ColorAvatar,
  [GenericAvatarSvg.datasets]: DatasetsAvatar,
  [GenericAvatarSvg.lasso]: LassoAvatar,
  [GenericAvatarSvg.layers]: LayersAvatar,
  [GenericAvatarSvg.magicWand]: MagicWandAvatar,
  [GenericAvatarSvg.paintBucket]: PaintBucketAvatar,
  [GenericAvatarSvg.pen]: PenAvatar,
  [GenericAvatarSvg.pencil]: PencilAvatar,
  [GenericAvatarSvg.scissors]: ScissorAvatar,
  [GenericAvatarSvg.selection]: SelectionAvatar,
  [GenericAvatarSvg.stamp]: StampAvatar,
  [GenericAvatarSvg.zoom]: ZoomAvatar
};

function Avatar(props: AvatarProps, ref: DOMRef<HTMLImageElement>) {
  let {
    alt = '',
    isDisabled,
    size = 5,
    src,
    generic,
    UNSAFE_style,
    UNSAFE_className = '',
    ...otherProps
  } = props;

  let SvgAvatar = generic ? genericAvatars[generic] : 'img';

  return (
    <SvgAvatar
      {...otherProps}
      ref={ref}
      alt={alt}
      role="img"
      style={UNSAFE_style}
      className={UNSAFE_className + imageStyles({isDisabled, size: String(size)}, props.css)}
      src={!generic ? src : undefined} />
  );
} 

let _Avatar = forwardRef(Avatar);
export {_Avatar as Avatar};
