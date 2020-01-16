import {DOMProps, StyleProps} from '@react-types/shared';

export interface ImageProps {
  loaded?: boolean, // not real, just makes ts happy for now
  isPlaceholder?: boolean, // same thing
  objectFit?: string, // move to styleProps for images
  src?: string,
  decorative?: boolean,
  alt?: string,
}

export interface SpectrumImageProps extends ImageProps, DOMProps, StyleProps {

}
