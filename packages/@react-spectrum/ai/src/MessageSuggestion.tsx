/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaLabelingProps, DOMProps, DOMRef, GlobalDOMAttributes} from '@react-types/shared';
import ArrowCurved from '@react-spectrum/s2/icons/ArrowCurved';
import {
  baseColor,
  centerPadding,
  focusRing,
  style
} from '@react-spectrum/s2/style' with {type: 'macro'};
import {ButtonProps, Button as RACButton} from 'react-aria-components/Button';
import {CenterBaseline} from '@react-spectrum/s2/CenterBaseline';
import {createContext, forwardRef, ReactNode, useContext} from 'react';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {IconContext} from '@react-spectrum/s2/Icon';
import {mergeStyles} from '@react-spectrum/s2/mergeStyles';
import {pressScale} from '@react-spectrum/s2';
import {Provider, SlotProps} from 'react-aria-components/slots';
import {StyleString} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useDOMRef} from './useDOMRef';
import {useLocale} from 'react-aria/I18nProvider';

const controlSizeM = {
  default: 32,
  size: {
    XS: 20,
    S: 24,
    L: 40,
    XL: 48
  }
} as const;

export interface MessageSuggestionProps extends Omit<
  ButtonProps,
  'style' | 'className' | 'isPending' | 'isDisabled' | 'render' | keyof GlobalDOMAttributes
> {
  /** The text content of the suggestion. */
  children: ReactNode;
  /**
   * The size of the MessageSuggestion.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL';
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StyleString;
}

const MessageSuggestionContext = createContext<{groupSize?: 'S' | 'M' | 'L' | 'XL'}>({});

const suggestionStyles = style<{
  isHovered: boolean;
  isPressed: boolean;
  isDisabled: boolean;
  isFocusVisible: boolean;
  isFocused: boolean;
  size: 'S' | 'M' | 'L' | 'XL';
}>({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'baseline',
  gap: 'text-to-visual',
  paddingX: 'pill',
  paddingY: 0,
  '--labelPadding': {
    type: 'paddingTop',
    value: centerPadding()
  },
  minHeight: controlSizeM,
  borderRadius: 'pill',
  font: {
    size: {
      S: 'body-sm',
      M: 'body',
      L: 'body-lg',
      XL: 'body-xl'
    }
  },
  backgroundColor: baseColor('gray-100'),
  color: 'neutral',
  borderStyle: 'none',
  disableTapHighlight: true,
  transition: 'default',
  textAlign: 'start',
  ...focusRing()
});

/**
 * MessageSuggestion renders a single pressable suggestion in a conversation.
 */
export const MessageSuggestion = forwardRef(function MessageSuggestion(
  props: MessageSuggestionProps,
  ref: DOMRef<HTMLButtonElement>
) {
  let domRef = useDOMRef<HTMLButtonElement>(ref);
  let {children, styles, size = 'M', ...otherProps} = props;
  let {direction} = useLocale();
  let isRTL = direction === 'rtl';

  let {groupSize} = useContext(MessageSuggestionContext);
  size = groupSize ? groupSize : size;

  // oxlint-disable react/react-compiler
  return (
    <RACButton
      {...filterDOMProps(props, {labelable: true})}
      {...otherProps}
      ref={domRef}
      style={pressScale(domRef)}
      className={renderProps => mergeStyles(suggestionStyles({...renderProps, size}), styles)}>
      <Provider
        values={[
          [
            IconContext,
            {
              styles: style({
                flexShrink: 0,
                '--iconPrimary': {
                  type: 'fill',
                  value: 'currentColor'
                }
              })
            }
          ]
        ]}>
        <CenterBaseline styles={style({order: 0, transform: {isRTL: 'scale(-1, 1)'}})({isRTL})}>
          <ArrowCurved />
        </CenterBaseline>
        <span className={style({paddingY: '--labelPadding'})}>{children}</span>
      </Provider>
    </RACButton>
  );
  // oxlint-enable react/react-compiler
});

export interface MessageSuggestionListProps extends DOMProps, AriaLabelingProps, SlotProps {
  /** The MessageSuggestion children to display. */
  children: ReactNode;
  /** Heading displayed above the suggestions. */
  title: string;
  /** The size of hte Buttons within the MessageSuggestionList. */
  size?: 'S' | 'M' | 'L' | 'XL';
  /**
   * Spectrum-defined styles, returned by the `style()` macro.
   */
  styles?: StyleString;
}

const listStyles = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8
});

const titleStyles = style({
  font: {
    size: {
      S: 'title-sm',
      M: 'title',
      L: 'title-lg',
      XL: 'title-xl'
    }
  },
  color: 'neutral',
  margin: 0,
  padding: 0
});

const responseStyles = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8
});

/**
 * MessageSuggestionList renders a group of suggestion responses with a title heading.
 */
export const MessageSuggestionList = forwardRef(function MessageSuggestionList(
  props: MessageSuggestionListProps,
  ref: DOMRef<HTMLDivElement>
) {
  let domRef = useDOMRef(ref);
  let {children, title, styles, size = 'M'} = props;

  return (
    <div
      {...filterDOMProps(props, {labelable: true})}
      ref={domRef}
      className={mergeStyles(listStyles, styles)}>
      <h3 className={titleStyles({size})}>{title}</h3>
      <MessageSuggestionContext.Provider value={{groupSize: size}}>
        <div className={responseStyles}>{children}</div>
      </MessageSuggestionContext.Provider>
    </div>
  );
});
