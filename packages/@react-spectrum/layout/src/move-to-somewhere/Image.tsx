import {classNames, filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {HTMLElement} from 'react-dom';
import React, {RefObject} from 'react';
import {useSlotProvider} from '@react-spectrum/utils';

export interface ImageProps {
  className?: string,
  slot?: string,
  alt: string,
  src: string
  objectFit?: string
}
// TODO: rename? Picture?
export const Image = React.forwardRef((props: ImageProps, ref: RefObject<HTMLElement>) => {
  let {
    className,
    slot = 'image',
    alt,
    src,
    objectFit,
    ...otherProps
  } = props;
  let {[slot]: slotClassName} = useSlotProvider();
  let {styleProps} = useStyleProps(otherProps);

  // TODO: this needs some thought, it's not easy to have img be the top level tag because it has unique properties that don't play nicely with a lot of other things
  // better to have it be wrapped by a div i think, but i haven't given it enough thought
  return (
    <div {...filterDOMProps(otherProps)} {...styleProps} style={{overflow: 'hidden'}} className={classNames({}, className, slotClassName)} ref={ref}>
      {/*
        // @ts-ignore */}
      <img src={src} alt={alt} style={{'object-fit': objectFit, height: '100%', width: '100%'}} />
    </div>
  );
});
