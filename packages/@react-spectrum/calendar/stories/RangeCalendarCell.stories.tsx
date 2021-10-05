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

function Cell({isToday, isSelected, isFocused, isHovered, isPressed, isDisabled, isRangeStart, isRangeEnd, isRangeSelection, isSelectionStart, isSelectionEnd}) {
  return (
    <span
      className={classNames(styles, 'spectrum-Calendar-date', {
        'is-today': isToday,
        'is-selected': isSelected,
        'is-focused': isFocused,
        'is-disabled': isDisabled,
        'is-range-start': isRangeStart,
        'is-range-end': isRangeEnd,
        'is-range-selection': isRangeSelection,
        'is-selection-start': isSelectionStart,
        'is-selection-end': isSelectionEnd,
        'is-hovered': isHovered,
        'is-pressed': isPressed
      })}>
      12
    </span>
  );
}

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
  {isSelectionEnd: true}
];

export default {
  title: 'Date and Time/RangeCalendar/cell'
};

export const Default = () => (
  <Grid columns={repeat(10, 100)}>
    {generatePowerset(states, (merged) =>
        (merged.isDisabled && (merged.isFocused || merged.isHovered || merged.isPressed)) ||
        (!merged.isSelected && (merged.isRangeSelection || merged.isSelectionStart || merged.isSelectionEnd || merged.isRangeStart || merged.isRangeEnd)) ||
        ((merged.isRangeStart || merged.isRangeEnd) && !merged.isRangeSelection) ||
        (merged.isRangeStart && merged.isRangeEnd) ||
        (merged.isSelectionStart && !merged.isRangeStart) ||
        (merged.isSelectionEnd && !merged.isRangeEnd)
      ).map(props => <div>{Object.keys(props).join(' ')}<div style={{position: 'relative', width: 40, height: 40, textAlign: 'center'}}><Cell {...props} /></div></div>)}
  </Grid>
  );

Default.story = {
  name: 'default'
};
