import {focusRing} from './style-utils' with { type: 'macro' };
import {style} from '../style-macro/spectrum-theme' with { type: 'macro' };
import {useFocusRing} from 'react-aria';
import {useRef} from 'react';

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

export interface AvatarStyleProps {
  generic?: GenericAvatarSvg,
  isDisabled?: boolean,
  size?: 4 | 4.5 | 5 | 5.5 | 6.5 | 7 | 8 | 9 | 10,
  alt?: string,
  src?: string
}

const imageStyles = style({
  ...focusRing(),
  borderRadius: 'full',
  size: {
    default: 5,
    size: {
      '4': 4,
      '4.5': 4.5,
      '5.5': 5.5,
      '6.5': 6.5,
      '7': 7,
      '8': 8,
      '9': 9,
      '10': 10
    }
  },
  opacity: {
    isDisabled: .3
  }
});

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

export function Avatar(props: AvatarStyleProps) {
  let ref = useRef(null);
  let {
    alt = '',
    isDisabled,
    size = 5,
    src,
    generic,
    ...otherProps
  } = props;
  let {isFocusVisible, focusProps} = useFocusRing();

  let SvgAvatar = !!generic ? genericAvatars[generic] : 'img';

  return (
    <SvgAvatar
      {...otherProps}
      {...focusProps}
      ref={ref}
      tabIndex={isDisabled ? undefined : 1}
      alt={alt}
      role="img"
      className={imageStyles({isDisabled, size: String(size), isFocusVisible: !isDisabled && isFocusVisible})}
      src={!generic ? src : undefined} />
  );
} 