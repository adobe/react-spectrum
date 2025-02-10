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

import {classNames} from '@react-spectrum/utils';
import {generatePowerset} from '@react-spectrum/story-utils';
import {Grid, repeat} from '@react-spectrum/layout';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/calendar/vars.css';
import {useProvider} from '@react-spectrum/provider';

export default {
  title: 'CalendarCall',
  excludeStories: ['AllStates']
};

let states = [
  {isToday: true},
  {isSelected: true},
  {isFocused: true},
  {isHovered: true},
  {isPressed: true},
  {isDisabled: true},
  {isRangeSelection: true},
  {isRangeStart: true},
  {isRangeEnd: true},
  {isSelectionStart: true},
  {isSelectionEnd: true},
  {isInvalid: true},
  {isUnavailable: true}
];

export const LightMedium = () => <AllStates />;
LightMedium.parameters = {
  chromaticProvider: {
    locales: ['en-US'],
    colorSchemes: ['light'],
    scales: ['medium']
  }
};

export const LightLarge = () => <AllStates />;
LightLarge.parameters = {
  chromaticProvider: {
    locales: ['en-US'],
    colorSchemes: ['light'],
    scales: ['large']
  }
};

export const DarkMedium = () => <AllStates />;
DarkMedium.parameters = {
  chromaticProvider: {
    locales: ['en-US'],
    colorSchemes: ['dark'],
    scales: ['medium']
  }
};

export const DarkLarge = () => <AllStates />;
DarkLarge.parameters = {
  chromaticProvider: {
    locales: ['en-US'],
    colorSchemes: ['dark'],
    scales: ['large']
  }
};

export function AllStates() {
  let {scale} = useProvider();
  let size = scale === 'medium' ? 40 : 50;
  return (
    <Grid columns={repeat(10, scale === 'medium' ? 100 : 120)}>
      {generatePowerset(states, (merged) =>
        (merged.isDisabled && (merged.isFocused || merged.isHovered || merged.isPressed || merged.isInvalid || merged.isSelected)) ||
        (merged.isUnavailable && (merged.isHovered || merged.isPressed || merged.isDisabled)) ||
        (merged.isSelected && merged.isUnavailable && !merged.isInvalid) ||
        (!merged.isSelected && (merged.isRangeSelection || merged.isSelectionStart || merged.isSelectionEnd || merged.isRangeStart || merged.isRangeEnd || merged.isInvalid)) ||
        ((merged.isRangeStart || merged.isRangeEnd) && !merged.isRangeSelection) ||
        (merged.isRangeStart && merged.isRangeEnd) ||
        (merged.isSelectionStart && !merged.isRangeStart) ||
        (merged.isSelectionEnd && !merged.isRangeEnd)
      ).map(props => (
        <div style={{whiteSpace: 'pre-wrap'}}>
          {Object.keys(props).join('\n')}
          <div style={{position: 'relative', width: size, height: size, textAlign: 'center'}}>
            <Cell {...props} />
          </div>
        </div>
      ))}
    </Grid>
  );
}

// Fake cell for testing css
function Cell({isToday, isSelected, isFocused, isHovered, isPressed, isDisabled, isRangeStart, isRangeEnd, isRangeSelection, isSelectionStart, isSelectionEnd, isInvalid, isUnavailable}) {
  return (
    <span
      className={classNames(styles, 'spectrum-Calendar-date', {
        'is-today': isToday,
        'is-selected': isSelected,
        'is-focused': isFocused,
        'is-disabled': isDisabled,
        'is-unavailable': isUnavailable,
        'is-range-start': isRangeStart,
        'is-range-end': isRangeEnd,
        'is-range-selection': isRangeSelection,
        'is-selection-start': isSelectionStart,
        'is-selection-end': isSelectionEnd,
        'is-hovered': isHovered,
        'is-pressed': isPressed,
        'is-invalid': isInvalid
      })}>
      <span className={classNames(styles, 'spectrum-Calendar-dateText')}><span>12</span></span>
    </span>
  );
}
