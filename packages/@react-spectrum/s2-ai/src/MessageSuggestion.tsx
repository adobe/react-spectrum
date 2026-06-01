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

import {AriaLabelingProps, DOMProps, DOMRef, DOMRefValue} from '@react-types/shared';
import ArrowCurved from '@react-spectrum/s2/icons/ArrowCurved';
import {ButtonProps, Button as RACButton} from 'react-aria-components/Button';
import {centerBaseline} from './CenterBaseline';
import {
  centerPadding,
  controlSize,
  getAllowedOverrides
} from './style-utils-copy' with {type: 'macro'};
import {ContextValue, Provider, SlotProps} from 'react-aria-components/slots';
import {createContext, forwardRef, ReactNode} from 'react';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {IconContext} from '@react-spectrum/s2/Icon';
import {pressScale} from '@react-spectrum/s2';
import type {StyleProps} from './style-utils-copy';
import {useDOMRef} from './useDOMRef';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface MessageSuggestionProps
  extends Omit<ButtonProps, 'style' | 'className' | 'isPending' | 'isDisabled'>, StyleProps {
  /** The text content of the suggestion. */
  children: ReactNode;
}

export const MessageSuggestionContext =
  createContext<ContextValue<Partial<MessageSuggestionProps>, DOMRefValue<HTMLButtonElement>>>(
    null
  );

const suggestionStyles = style<{
  isHovered: boolean;
  isPressed: boolean;
  isDisabled: boolean;
  isFocusVisible: boolean;
  isFocused: boolean;
}>(
  {
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
    minHeight: controlSize(),
    borderRadius: 'pill',
    font: 'body',
    backgroundColor: {
      default: 'gray-100',
      isHovered: 'gray-200',
      isPressed: 'gray-300'
    },
    color: 'neutral',
    borderStyle: 'none',
    disableTapHighlight: true,
    ...focusRing()
  },
  getAllowedOverrides()
);

/**
 * MessageSuggestion renders a single pressable suggestion in a conversation.
 */
export const MessageSuggestion = forwardRef(function MessageSuggestion(
  props: MessageSuggestionProps,
  ref: DOMRef<HTMLButtonElement>
) {
  [props, ref] = useSpectrumContextProps(props, ref, MessageSuggestionContext);
  let domRef = useDOMRef<HTMLButtonElement>(ref);
  let {children, UNSAFE_className = '', UNSAFE_style, styles, ...otherProps} = props;

  return (
    <RACButton
      {...filterDOMProps(props, {labelable: true})}
      {...otherProps}
      ref={domRef}
      style={pressScale(domRef, UNSAFE_style)}
      className={renderProps => UNSAFE_className + '' + suggestionStyles(renderProps, styles)}>
      <Provider
        values={[
          [
            IconContext,
            {
              render: centerBaseline({slot: 'icon', styles: style({order: 0})}),
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
        <ArrowCurved />
        <span className={style({paddingY: '--labelPadding'})}>{children}</span>
      </Provider>
    </RACButton>
  );
});

export interface MessageSuggestionListProps
  extends DOMProps, AriaLabelingProps, StyleProps, SlotProps {
  /** The MessageSuggestion children to display. */
  children: ReactNode;
  /** Heading displayed above the suggestions. */
  title: string;
}

export const MessageSuggestionListContext =
  createContext<ContextValue<Partial<MessageSuggestionListProps>, DOMRefValue<HTMLDivElement>>>(
    null
  );

const listStyles = style(
  {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  getAllowedOverrides()
);

const titleStyles = style({
  font: 'heading-xs',
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
  [props, ref] = useSpectrumContextProps(props, ref, MessageSuggestionListContext);
  let domRef = useDOMRef(ref);
  let {children, title, UNSAFE_className = '', UNSAFE_style, styles} = props;

  return (
    <div
      {...filterDOMProps(props, {labelable: true})}
      ref={domRef}
      style={UNSAFE_style}
      className={(UNSAFE_className || '') + listStyles(null, styles)}>
      <h3 className={titleStyles}>{title}</h3>
      <div className={responseStyles}>{children}</div>
    </div>
  );
});
