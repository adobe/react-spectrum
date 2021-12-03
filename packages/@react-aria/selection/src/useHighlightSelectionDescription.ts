/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaLabelingProps} from '@react-types/shared';
import {GridState} from '@react-stately/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useDescription} from '@react-aria/utils';
import {useInteractionModality} from '@react-aria/interactions';
import {useMemo} from 'react';
import {useMessageFormatter} from '@react-aria/i18n';

/**
 * Computes the description for a grid selectable collection.
 * @param props
 * @param state
 */
export function useHighlightSelectionDescription(props, state: GridState<any, any>): AriaLabelingProps {
  let formatMessage = useMessageFormatter(intlMessages);
  let modality = useInteractionModality();
  let shouldLongPress = (modality === 'pointer' || modality === 'virtual') && 'ontouchstart' in window;

  let interactionDescription = useMemo(() => {
    let selectionMode = state.selectionManager.selectionMode;
    let selectionBehavior = state.selectionManager.selectionBehavior;

    let message = undefined;
    if (shouldLongPress) {
      message = formatMessage('longPressToSelect');
    }

    return selectionBehavior === 'replace' && selectionMode !== 'none' && state.selectionManager.hasItemActions ? message : undefined;
  }, [state.selectionManager.selectionMode, state.selectionManager.selectionBehavior, state.selectionManager.hasItemActions, formatMessage, shouldLongPress]);

  let descriptionProps = useDescription(interactionDescription);
  return descriptionProps;
}
