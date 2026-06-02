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

import {AriaLabelingProps, DOMProps, DOMRef, DOMRefValue, Selection} from '@react-types/shared';
import {ContextValue, SlotProps} from 'react-aria-components/slots';
import {createContext, forwardRef} from 'react';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {getAllowedOverrides} from './style-utils-copy' with {type: 'macro'};
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ToggleButtonGroup as RACToggleButtonGroup} from 'react-aria-components/ToggleButtonGroup';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import type {StyleProps} from './style-utils-copy';
import ThumbDown from '@react-spectrum/s2/icons/ThumbDown';
import ThumbUp from '@react-spectrum/s2/icons/ThumbUp';
import {ToggleButton} from '@react-spectrum/s2/ToggleButton';
import {useDOMRef} from './useDOMRef';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export type MessageFeedbackValue = 'up' | 'down' | null;

export interface MessageFeedbackProps extends DOMProps, AriaLabelingProps, StyleProps, SlotProps {
  /** The selected feedback value (controlled). */
  value?: MessageFeedbackValue;
  /** The default feedback value (uncontrolled). */
  defaultValue?: MessageFeedbackValue;
  /** Called when the selection changes, including when toggled off (value=null). */
  onChange?: (value: MessageFeedbackValue) => void;
  /** Called when a selection is made (not when toggled off). */
  onFeedback?: (value: Exclude<MessageFeedbackValue, null>) => void;
  /** Whether the feedback controls are disabled. */
  isDisabled?: boolean;
  /** Accessible label for the thumbs up button. */
  thumbUpLabel?: string;
  /** Accessible label for the thumbs down button. */
  thumbDownLabel?: string;
}

export const MessageFeedbackContext =
  createContext<ContextValue<Partial<MessageFeedbackProps>, DOMRefValue<HTMLDivElement>>>(null);

const groupStyles = style(
  {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  getAllowedOverrides()
);

function selectionToValue(selection: Selection): MessageFeedbackValue {
  if (selection === 'all') {
    return null;
  }
  let [first] = selection;
  return first === 'up' || first === 'down' ? first : null;
}

/**
 * MessageFeedback collects thumbs up / thumbs down feedback on an AI response.
 */
export const MessageFeedback = forwardRef(function MessageFeedback(
  props: MessageFeedbackProps,
  ref: DOMRef<HTMLDivElement>
) {
  [props, ref] = useSpectrumContextProps(props, ref, MessageFeedbackContext);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2-ai');
  let domRef = useDOMRef(ref);
  let {
    value,
    defaultValue,
    onChange,
    onFeedback,
    isDisabled,
    thumbUpLabel,
    thumbDownLabel,
    UNSAFE_className = '',
    UNSAFE_style,
    styles
  } = props;

  let handleSelectionChange = (selection: Selection): void => {
    let next = selectionToValue(selection);
    onChange?.(next);
    if (next !== null) {
      onFeedback?.(next);
    }
  };

  let toKeys = (v: MessageFeedbackValue | undefined): Iterable<string> | undefined => {
    if (v === undefined) {
      return undefined;
    }
    return v === null ? [] : [v];
  };
  let selectedKeys = toKeys(value);
  let defaultSelectedKeys = toKeys(defaultValue);

  return (
    <RACToggleButtonGroup
      {...filterDOMProps(props, {labelable: true})}
      ref={domRef}
      selectionMode="single"
      selectedKeys={selectedKeys}
      defaultSelectedKeys={defaultSelectedKeys}
      onSelectionChange={handleSelectionChange}
      isDisabled={isDisabled}
      style={UNSAFE_style}
      className={UNSAFE_className + groupStyles(null, styles)}>
      <ToggleButton
        id="up"
        isQuiet
        aria-label={thumbUpLabel ?? stringFormatter.format('messagefeedback.thumbUp')}>
        <ThumbUp />
      </ToggleButton>
      <ToggleButton
        id="down"
        isQuiet
        aria-label={thumbDownLabel ?? stringFormatter.format('messagefeedback.thumbDown')}>
        <ThumbDown />
      </ToggleButton>
    </RACToggleButtonGroup>
  );
});
