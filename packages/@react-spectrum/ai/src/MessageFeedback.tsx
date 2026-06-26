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

import {AriaLabelingProps, DOMProps, DOMRef, Selection} from '@react-types/shared';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {forwardRef} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {SlotProps} from 'react-aria-components/slots';
import {StylesPropWithHeight} from '@react-spectrum/s2';
import ThumbDown from '@react-spectrum/s2/icons/ThumbDown';
import ThumbUp from '@react-spectrum/s2/icons/ThumbUp';
import {ToggleButton} from '@react-spectrum/s2/ToggleButton';
import {ToggleButtonGroup} from '@react-spectrum/s2/ToggleButtonGroup';
import {useDOMRef} from './useDOMRef';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';

export type MessageFeedbackValue = 'up' | 'down' | null;

export interface MessageFeedbackProps extends DOMProps, AriaLabelingProps, SlotProps {
  /** The selected feedback value (controlled). */
  value?: MessageFeedbackValue;
  /** The default feedback value (uncontrolled). */
  defaultValue?: MessageFeedbackValue;
  /** Called when the selection changes, including when toggled off (value=null). */
  onChange?: (value: MessageFeedbackValue) => void;
  /** Whether the feedback controls are disabled. */
  isDisabled?: boolean;
  /** Accessible label for the thumbs up button. */
  thumbUpLabel?: string;
  /** Accessible label for the thumbs down button. */
  thumbDownLabel?: string;
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesPropWithHeight;
}

function selectionToValue(selection: Selection): MessageFeedbackValue {
  let [first] = selection as Iterable<string>;
  return first === 'up' || first === 'down' ? first : null;
}

/**
 * MessageFeedback collects thumbs up / thumbs down feedback on an AI response.
 */
export const MessageFeedback = forwardRef(function MessageFeedback(
  props: MessageFeedbackProps,
  ref: DOMRef<HTMLDivElement>
) {
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/ai');
  let domRef = useDOMRef(ref);
  let {value, defaultValue, onChange, isDisabled, thumbUpLabel, thumbDownLabel, styles} = props;

  let handleSelectionChange = (selection: Selection): void => {
    onChange?.(selectionToValue(selection));
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
    <ToggleButtonGroup
      {...filterDOMProps(props, {labelable: true})}
      ref={domRef}
      selectionMode="single"
      selectedKeys={selectedKeys}
      defaultSelectedKeys={defaultSelectedKeys}
      onSelectionChange={handleSelectionChange}
      isDisabled={isDisabled}
      styles={styles}>
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
    </ToggleButtonGroup>
  );
});
