import {classNames} from '@react-spectrum/utils';
import {generatePowerset} from '@react-spectrum/story-utils';
import {Grid, repeat} from '@react-spectrum/layout';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/calendar/vars.css';

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

// Fake cell for testing css
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
      <span className={classNames(styles, 'spectrum-Calendar-dateText')}>12</span>
    </span>
  );
}

export const Default = {
  render: () => (
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
  )
};
