import {classNames, filterDOMProps, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import React from 'react';
import {SpectrumImageProps} from '@react-types/image';
import {useProviderProps} from '@react-spectrum/provider';

// incomplete component for show right now

function Image(props: SpectrumImageProps, ref: DOMRef<HTMLDivElement>) {
  let defaults = {slot: 'image'};
  props = {...defaults, ...props};
  let {
    loaded,
    isPlaceholder,
    objectFit,
    src,
    decorative,
    alt,
    ...otherProps
  } = useProviderProps(props);
  let {styleProps} = useStyleProps(otherProps);
  let domRef = useDOMRef(ref);

  if (decorative) {
    alt = '';
  }

  if (alt == null) {
    console.warn(
      'Neither the `alt` prop or `decorative` were provided to an image. ' +
      'Add `alt` text for screen readers, or enable the `decorative` prop to indicate that the image ' +
      'is decorative or redundant with displayed text and should not be annouced by screen readers.'
    );
  }

  return (
    <div
      {...filterDOMProps(props)}
      {...styleProps}
      style={{overflow: 'hidden'}}
      ref={domRef}>
      <img
        className={classNames({}, 'react-spectrum-Image', {
          'is-loaded': loaded,
          'is-placeholder': isPlaceholder
        })}
        src={src}
        alt={alt}
        style={{objectFit, height: '100%', width: '100%'}} />
    </div>
  );
}

const _Image = React.forwardRef(Image);
export {_Image as Image};
