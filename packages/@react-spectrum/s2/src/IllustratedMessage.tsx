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

import {ButtonGroupContext} from './ButtonGroup';
import {ContentContext, HeadingContext} from './Content';
import {ContextValue, Provider} from 'react-aria-components';
import {createContext, forwardRef, ReactNode} from 'react';
import {DOMProps, DOMRef, DOMRefValue} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import {getAllowedOverrides, StylesPropWithHeight, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {IllustrationContext} from './Icon';
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

interface IllustratedMessageStyleProps {
  /**
   * The size of the IllustratedMessage.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L',
  /**
   * The direction that the IllustratedMessage should be laid out in.
   *
   * @default 'vertical'
   */
  orientation?: 'horizontal' | 'vertical'
}

interface S2SpectrumIllustratedMessageProps extends DOMProps, UnsafeStyles, IllustratedMessageStyleProps {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight,
  /** The content to display in the IllustratedMessage. */
  children: ReactNode
}

const illustratedMessage = style<IllustratedMessageStyleProps & {isInDropZone?: boolean}>({
  display: 'grid',
  fontFamily: 'sans',
  fontSize: 'control',
  maxWidth: {
    orientation: {
      vertical: 380,
      horizontal: 528 // ask design about max width for horizontal because doesn't look great when L
    }
  },
  gridTemplateAreas: {
    orientation: {
      vertical: [
        '   .  illustration .   ',
        '   .       .       .   ',
        'heading heading heading',
        '   .       .       .   ',
        'content content content',
        '   .  buttonGroup  .   '
      ],
      horizontal: [
        'illustration . heading',
        'illustration .    .   ',
        'illustration . content',
        'illustration . buttonGroup'
      ]
    }
  },
  gridTemplateRows: {
    orientation: {
      vertical: {
        default: ['min-content', 12, 'min-content', 4, 'min-content', 'min-content'],
        size: {
          L: ['min-content', 8, 'min-content', 4, 'min-content', 'min-content']
        }
      },
      horizontal: ['1fr', 4, '1fr']
    }
  },
  gridTemplateColumns: {
    orientation: {
      horizontal: ['1fr', 12, 'auto']
    }
  },
  justifyItems: {
    orientation: {
      vertical: 'center',
      horizontal: 'start'
    }
  },
  textAlign: {
    orientation: {
      vertical: 'center'
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
  '--iconPrimary': {
    type: 'color',
    value: {
      default: 'neutral',
      isDropTarget: 'accent'
    }
  }
});

const heading = style<IllustratedMessageStyleProps>({
  gridArea: 'heading',
  font: {
    size: {
      S: 'title',
      M: 'title-xl',
      L: 'title-2xl'
    }
  },
  alignSelf: 'end',
  margin: 0
});

const content = style({
  font: {
    size: {
      S: 'body-xs',
      M: 'body-sm',
      L: 'body-sm'
    }
  },
  gridArea: 'content',
  alignSelf: 'start'
});

const buttonGroup = style({
  gridArea: 'buttonGroup',
  marginTop: 16
});

interface IllustratedMessageContextProps extends Partial<S2SpectrumIllustratedMessageProps> {
  isInDropZone?: boolean,
  isDropTarget?: boolean
}

export const IllustratedMessageContext = createContext<ContextValue<IllustratedMessageContextProps, DOMRefValue<HTMLDivElement>>>(null);

/**
 * An IllustratedMessage displays an illustration and a message, usually
 * for an empty state or an error page.
 */
export const IllustratedMessage = /*#__PURE__*/ forwardRef(function IllustratedMessage(props: S2SpectrumIllustratedMessageProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, IllustratedMessageContext);
  let domRef = useDOMRef(ref);
  let {
    children,
    orientation = 'horizontal',
    size = 'M',
    UNSAFE_className = '',
    UNSAFE_style,
    isInDropZone = false,
    isDropTarget = false,
    ...otherProps
  } = props as IllustratedMessageContextProps;

  return (
    <div
      {...filterDOMProps(otherProps)}
      style={UNSAFE_style}
      className={UNSAFE_className + illustratedMessage({
        size: props.size || 'M',
        orientation: props.orientation || 'vertical'
      }, props.styles)}
      ref={domRef}>
      <Provider
        values={[
          [HeadingContext, {styles: heading({orientation, size})}],
          [ContentContext, {styles: content({size})}],
          [IllustrationContext, {size: size === 'L' ? 'L' : 'M', styles: illustration({orientation, size, isInDropZone, isDropTarget})}],
          [ButtonGroupContext, {styles: buttonGroup}]
        ]}>
        {children}
      </Provider>
    </div>
  );
});
