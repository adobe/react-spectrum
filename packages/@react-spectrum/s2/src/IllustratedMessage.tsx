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
import {ReactNode, forwardRef, useContext, createContext} from 'react';
import {SpectrumIllustratedMessageProps} from '@react-types/illustratedmessage';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {IllustrationContext} from './Illustration';
import {mergeStyles} from '../style-macro/runtime';
import {HeadingContext, Provider} from 'react-aria-components';
import {ContentContext} from './Content';
import {DOMRef} from '@react-types/shared';
import {useDOMRef} from '@react-spectrum/utils';
import {ButtonGroupContext} from './ButtonGroup';

interface S2SpectrumIllustratedMessageProps extends Omit<SpectrumIllustratedMessageProps, 'className' | 'style' | 'children'>, IllustratedMessageStyleProps {
  className?: string,
  children: ReactNode
}

interface IllustratedMessageStyleProps {
  size?: 'S' | 'M' | 'L',
  orientation?: 'horizontal' | 'vertical'
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
        default: ['min-content', 3, 'min-content', 1, 'min-content', 'min-content'],
        size: {
          L: ['min-content', 2, 'min-content', 1, 'min-content', 'min-content']
        }
      },
      vertical: ['1fr', 1, '1fr']
    }
  },
  gridTemplateColumns: {
    orientation: {
      vertical: ['1fr', 3, 'auto']
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
});

const illustration = style<IllustratedMessageStyleProps & {isInDropZone?: boolean, isDropTarget?: boolean}>({
  gridArea: 'illustration',
  size: {
    size: { 
      S: 24,
      M: 24,
      L: 40
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
      S: 'lg',
      M: 'xl',
      L: '3xl'
    }
  },
  alignSelf: 'end',
  margin: 0
});

const content = style<IllustratedMessageStyleProps>({
  color: 'gray-800',
  gridArea: 'content',
  alignSelf: 'start'
});

const buttonGroup = style({
  gridArea: 'buttonGroup',
  marginTop: 4
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
    ...otherProps
  } = props;

  let domRef = useDOMRef(ref);

  let ctx = useContext(IllustratedMessageContext);
  let isInDropZone = !!ctx;
  let isDropTarget = ctx ? ctx.isDropTarget : false;

  return (
    <div
      {...filterDOMProps(otherProps)}
      className={mergeStyles(props.className, illustratedMessage({
        size: props.size || 'M',
        orientation: props.orientation || 'horizontal'
      }))}
      ref={domRef}>
      <Provider 
        values={[
          [HeadingContext, {className: heading({orientation, size})}],
          [ContentContext, {className: content({orientation, size})}],
          [IllustrationContext, {className: illustration({orientation, size, isInDropZone, isDropTarget})}],
          [ButtonGroupContext, {className: buttonGroup()}]
        ]}>
        {children}
      </Provider>
    </div>
  );
}

let _IllustratedMessage = forwardRef(IllustratedMessage);
export {_IllustratedMessage as IllustratedMessage};
