/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {announce} from '@react-aria/live-announcer';
import {GridCollection} from '@react-types/grid';
import {GridState} from '@react-stately/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {Key} from '@react-types/shared';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useUpdateEffect} from '@react-aria/utils';

export interface GridEditAnnouncementProps {
  /**
   * A function that returns the text that should be announced by assistive technology when a cell is edited.
   * @default (key) => state.collection.getItem(key)?.textValue
   */
  getEditText?: (key: Key) => string
}

export function useGridEditAnnouncement<T>(props: GridEditAnnouncementProps, state: GridState<T, GridCollection<T>>) {
  let {
    getEditText = (key) => state.collection.getTextValue?.(key) ?? state.collection.getItem(key)?.textValue
  } = props;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let formatter = useLocalizedStringFormatter(intlMessages, '@react-aria/grid');

  useUpdateEffect(() => {
    // TODO: announce properly once we have translations
    if (!state.selectionManager.isEditing) {
      // announce(formatter.format('edited'), 'assertive', 500);
      return;
    }

    let textValue = getEditText(state.selectionManager.editKey);

    announce(textValue, 'assertive', 500);
  }, [state.selectionManager.editKey]);
}
