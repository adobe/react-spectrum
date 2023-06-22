/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {classNames, SlotProvider, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {AriaLabelingProps, DOMProps, DOMRef, StyleProps} from '@react-types/shared';
import {DropOptions, mergeProps, useClipboard, useDrop, useFocusRing, useHover, VisuallyHidden} from 'react-aria';
import React, {ReactNode, useRef, useState} from 'react';
import styles from '@adobe/spectrum-css-temp/components/dropzone/vars.css';
import {filterDOMProps} from '@react-aria/utils';
import {DropZone as RACDropZone} from 'react-aria-components';
export interface SpectrumDropZoneProps extends Omit<DropOptions, 'getDropOperationForPoint'>, DOMProps, StyleProps, AriaLabelingProps {
  children: ReactNode
}

// what ref do we need? i just put a temp one for now... (follow TextField)
function DropZone(props: SpectrumDropZoneProps, ref: DOMRef<HTMLDivElement>) {
  let {children, ...otherProps} = props;
  let buttonRef = useRef<HTMLButtonElement>(null);
  let domRef = useDOMRef(ref); // again not sure if this is what i wanna do but it looks similar to what is done in Menu
  let {styleProps} = useStyleProps(otherProps); // will probably take something like otherProps but just for now this is what it is 

  // will need to think about this a bit more but i think this is a state we will need to track for styling purposes
  let [isFilled, setIsFilled] = useState(false); // what can we use to determine if dropzone is filled? onDrop? onChange? how will this work... look into useEffect for this?

  // do we need to filterDOMProps?
  let domProps = filterDOMProps(props);
  delete domProps.id;

  // we're gonna need that banner thing to appear when it is a droptarget... 
  // that will appear when isDropTarget is true? what animations do we want to do? what should that banner even be?
  // does that banner only appear when the drop target isFilled?
  // what should the screen reader experience be? (maybe there wouldn't be anything since i dont think this banner would ever be focusable)

  // isDisabled? validation states? errorMessage? (let's ask design)
  // what should we do when an invalid object is dropped (for like the css)

  // should the illustration also turn blue when the dropzone is focused on? (yes)

  
  return (
    // might need to rework the css for the illustrated message
    // are we gonna use slot provider for <IllustratedMessage>? Do we need to wrap it around <ClearSlots>?

    <div 
      {...styleProps}
      className={
            classNames(
              styles,
              'spectrum-Dropzone',
              // {
              //   'is-hovered': isHovered,
              //   'is-dragged': isDropTarget,
              //   'focus-ring': isFocusVisible || isFocused
              // },
              styleProps.className 
            )
          } >
      <RACDropZone>
        <SlotProvider
          slots={{illustration: {UNSAFE_className: classNames(styles, 'spectrum-IllustratedMessage')}}}> 
          {children}
        </SlotProvider>
      </RACDropZone>
    </div>


    // eslint-disable-next-line
    // <div
    //   {...styleProps}
    //   {...mergeProps(dropProps, hoverProps)}
    //   data-drop-target={isDropTarget || undefined} // do we want this data attribute or should it be included somewhere else? maybe as a class instead?
    //   className={
    //     classNames(
    //       styles,
    //       'spectrum-Dropzone',
    //       {
    //         'is-hovered': isHovered,
    //         'is-dragged': isDropTarget,
    //         'focus-ring': isFocusVisible || isFocused
    //       },
    //       styleProps.className 
    //     )
    //   }
    //   ref={domRef}
    //   onClick={() => buttonRef.current?.focus()} >
    //   <VisuallyHidden>
    //     <button 
    //       {...mergeProps(dropButtonProps, clipboardProps, focusProps)}
    //       ref={buttonRef} />
    //   </VisuallyHidden>
      // <SlotProvider
      //   slots={{illustration: {UNSAFE_className: classNames(styles, 'spectrum-IllustratedMessage')}}}> 
      //   {children}
      // </SlotProvider>
    // </div>
  );
}
  // do we need to create a class for the svg in IllustratedMessage? cause we want to change the color of the svg when the dropzone is dragged over

let _DropZone = React.forwardRef(DropZone);
export {_DropZone as DropZone};
