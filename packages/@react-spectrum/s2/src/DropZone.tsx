/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ContextValue, DropZoneRenderProps, DropZone as RACDropZone, DropZoneProps as RACDropZoneProps} from 'react-aria-components';
import {createContext, forwardRef, ReactNode} from 'react';
import {DOMProps, DOMRef, DOMRefValue} from '@react-types/shared';
import {getAllowedOverrides, StylesPropWithHeight, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {IllustratedMessageContext} from './IllustratedMessage';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface DropZoneProps extends Omit<RACDropZoneProps, 'className' | 'style' | 'children' | 'isDisabled' | 'onHover' | 'onHoverStart' | 'onHoverEnd' | 'onHoverChange'>, UnsafeStyles, DOMProps {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight,
  /** The content to display in the drop zone. */
  children?: ReactNode,
  /** Whether the drop zone has been filled. */
  isFilled?: boolean,
  /** The message to replace the default banner message that is shown when the drop zone is filled. */
  replaceMessage?: string
}

export const DropZoneContext = createContext<ContextValue<DropZoneProps, DOMRefValue<HTMLDivElement>>>(null);

const dropzone = style<DropZoneRenderProps>({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  fontFamily: 'sans',
  color: 'gray-900',
  borderStyle: {
    default: 'dashed',
    isDropTarget: 'solid'
  },
  backgroundColor: {
    isDropTarget: 'blue-200'
  },
  borderWidth: 2,
  borderColor: {
    default: 'gray-300',
    isDropTarget: 'blue-800',
    isFocusVisible: 'blue-800'
  },
  borderRadius: 'lg',
  padding: 24
}, getAllowedOverrides({height: true}));

const banner = style<DropZoneRenderProps>({
  position: 'absolute',
  left: 0,
  right: 0,
  marginX: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 20,
  maxWidth: 208,
  backgroundColor: 'accent',
  borderRadius: 'default',
  color: 'white',
  fontWeight: 'bold',
  padding: '[calc((self(minHeight))/1.5)]'
});

function DropZone(props: DropZoneProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, DropZoneContext);
  let domRef = useDOMRef(ref);

  return (
    <RACDropZone
      {...props}
      ref={domRef}
      style={props.UNSAFE_style}
      className={renderProps => (props.UNSAFE_className || '') + dropzone(renderProps, props.styles)}>
      {renderProps => (
        <>
          <IllustratedMessageContext.Provider value={{isInDropZone: true, isDropTarget: renderProps.isDropTarget}}>
            {props.children}
          </IllustratedMessageContext.Provider>
          {(renderProps.isDropTarget && props.isFilled) &&
            <div className={banner(renderProps)}>
              <span>
                {props.replaceMessage ? props.replaceMessage : 'Drop file to replace'}
              </span>
            </div>
          }
        </>
      )}
    </RACDropZone>
  );
}

/**
 * A drop zone is an area into which one or multiple objects can be dragged and dropped.
 */
let _DropZone = /*#__PURE__*/ forwardRef(DropZone);
export {_DropZone as DropZone};
