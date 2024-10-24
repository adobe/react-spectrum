/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaButtonProps} from '@react-types/button';
import {DOMAttributes} from 'react';
import * as DragManager from './DragManager';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useDescription} from '@react-aria/utils';
import {useDragModality} from './utils';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

interface VirtualDropResult {
  dropProps: AriaButtonProps & DOMAttributes<HTMLDivElement>
}

const MESSAGES = {
  keyboard: 'dropDescriptionKeyboard',
  touch: 'dropDescriptionTouch',
  virtual: 'dropDescriptionVirtual'
};

export function useVirtualDrop(): VirtualDropResult {
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/dnd');
  let modality = useDragModality();
  let dragSession = DragManager.useDragSession();
  let descriptionProps = useDescription(dragSession ? stringFormatter.format(MESSAGES[modality]) : '');

  return {
    dropProps: {
      ...descriptionProps,
      // Mobile Safari does not properly bubble click events on elements except links or inputs
      // unless there is an onclick handler bound directly to the element itself. By adding this
      // handler, React will take care of adding that for us, and we are able to handle document
      // level click events in the DragManager.
      // See https://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
      onClick: () => {}
    }
  };
}
