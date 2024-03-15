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

import {filterDOMProps} from '@react-aria/utils';
import {forwardRef, ReactNode, useContext, createContext} from 'react';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {IllustrationContext} from './Illustration';
import {HeadingContext, Provider} from 'react-aria-components';
import {ContentContext} from './Content';
import {DOMProps, DOMRef} from '@react-types/shared';
import {useDOMRef} from '@react-spectrum/utils';
import {ButtonGroupContext} from './ButtonGroup';
import {CSSPropWithHeight, getAllowedOverrides, UnsafeStyles} from './style-utils' with {type: 'macro'};

interface IllustratedMessageStyleProps {
  /**
   * The size of the IllustratedMessage.
   *
   * @default "M"
   */
  size?: 'S' | 'M' | 'L',
  /**
   * The direction that the IllustratedMessage should be laid out in.
   *
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical'
}

interface S2SpectrumIllustratedMessageProps extends DOMProps, UnsafeStyles, IllustratedMessageStyleProps {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  css?: CSSPropWithHeight,
  /** The content to display in the IllustratedMessage. */
  children: ReactNode
}

const illustratedMessage = style<IllustratedMessageStyleProps & {isInDropZone?: boolean}>({
  display: 'grid',
  fontFamily: 'sans',
  fontSize: 'control',
  maxWidth: {
    orientation: {
      horizontal: '[380px]',
      vertical: '[33rem]' // ask design about max width for vertical because doesn't look great when L
    }
  },
  gridTemplateAreas: {
    orientation: {
      horizontal: [
        '   .  illustration .   ',
        '   .       .       .   ',
        'heading heading heading',
        '   .       .       .   ',
        'content content content',
        '   .  buttonGroup  .   '
      ],
      vertical: [
        'illustration . heading',
        'illustration .    .   ',
        'illustration . content',
        'illustration . buttonGroup'
      ]
    }
  },
  gridTemplateRows: {
    orientation: {
      horizontal: {
        default: ['min-content', 12, 'min-content', 4, 'min-content', 'min-content'],
        size: {
          L: ['min-content', 8, 'min-content', 4, 'min-content', 'min-content']
        }
      },
      vertical: ['1fr', 4, '1fr']
    }
  },
  gridTemplateColumns: {
    orientation: {
      vertical: ['1fr', 12, 'auto']
    }
  },
  justifyItems: {
    orientation: {
      horizontal: 'center',
      vertical: 'start'
    }
  },
  textAlign: {
    orientation: {
      horizontal: 'center'
    }
  }
}, getAllowedOverrides({height: true}));

const illustration = style<IllustratedMessageStyleProps & {isInDropZone?: boolean, isDropTarget?: boolean}>({
  gridArea: 'illustration',
  size: {
    size: {
      S: 96,
      M: 96,
      L: 160
    }
  },
  alignSelf: 'center',
  color: {
    // TODO: ask design about what the color should be. Says gray-800 in the figma file, neutral in token spec, but different neutral in dropzone spec
    default: 'gray-800',
    isInDropZone: 'gray-500', // neutral doesn't seem to match the color in figma, opted for gray-500 instead
    isDropTarget: 'accent'
  }
});

const heading = style<IllustratedMessageStyleProps>({
  gridArea: 'heading',
  color: 'heading',
  fontSize: {
    size: {
      S: 'body',
      M: 'body-xl',
      L: 'body-2xl'
    }
  },
  alignSelf: 'end',
  margin: 0
});

const content = style({
  color: 'gray-800',
  gridArea: 'content',
  alignSelf: 'start'
});

const buttonGroup = style({
  gridArea: 'buttonGroup',
  marginTop: 16
});

interface IllustratedMessageContextProps extends Omit<S2SpectrumIllustratedMessageProps, 'children'> {
  isInDropZone?: boolean,
  isDropTarget?: boolean
}

export const IllustratedMessageContext = createContext<IllustratedMessageContextProps | null>(null);

function IllustratedMessage(props: S2SpectrumIllustratedMessageProps, ref: DOMRef<HTMLDivElement>) {
  let {
    children,
    orientation = 'horizontal',
    size = 'M',
    UNSAFE_className = '',
    UNSAFE_style,
    ...otherProps
  } = props;

  let domRef = useDOMRef(ref);

  let ctx = useContext(IllustratedMessageContext);
  let isInDropZone = !!ctx;
  let isDropTarget = ctx ? ctx.isDropTarget : false;

  return (
    <div
      {...filterDOMProps(otherProps)}
      style={UNSAFE_style}
      className={UNSAFE_className + illustratedMessage({
        size: props.size || 'M',
        orientation: props.orientation || 'horizontal'
      }, props.css)}
      ref={domRef}>
      <Provider
        values={[
          [HeadingContext, {className: heading({orientation, size})}],
          [ContentContext, {className: content}],
          [IllustrationContext, {className: illustration({orientation, size, isInDropZone, isDropTarget})}],
          [ButtonGroupContext, {css: buttonGroup}]
        ]}>
        {children}
      </Provider>
    </div>
  );
}

let _IllustratedMessage = forwardRef(IllustratedMessage);
export {_IllustratedMessage as IllustratedMessage};
