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

import {
  AnyDateTime,
  CalendarDate,
  DateFields,
  DateFormatter,
  getLocalTimeZone,
  parseAbsolute,
  parseDate,
  parseDateTime,
  parseTime,
  parseZonedDateTime,
  TimeFields,
  toCalendar,
  toTimeZone,
  ZonedDateTime
} from '@internationalized/date';
import {DateFieldState} from 'react-stately/useDateFieldState';
import {NumberParser} from '@internationalized/number';

export type DateFieldValues = DateFields & TimeFields & {offset?: number};

const NUMERIC_SEGMENTS = new Set(['year', 'month', 'day', 'hour', 'minute', 'second']);
const BIDI_ISOLATES = /[\u2066-\u2069]/g;

/**
 * Returns the field's value as it is displayed, or an empty string if the field is
 * empty or only partially filled in.
 */
export function getDateFieldText(state: DateFieldState): string {
  if (state.value == null || state.segments.some(s => s.isEditable && s.isPlaceholder)) {
    return '';
  }

  return state.segments
    .map(s => s.text)
    .join('')
    .replace(BIDI_ISOLATES, '');
}

/**
 * Parses pasted text into date and time fields for the given date field. Two formats are accepted:
 * ISO 8601 strings (e.g. 2026-11-04, 2026-11-04T14:30, 14:30), and the field's own display format
 * in its locale (e.g. 11/4/2026, 2:30 PM). Separators between segments are not required to match.
 * Returns null if the text is not a complete value for the displayed segments.
 */
export function parseDateFieldText(
  text: string,
  state: DateFieldState,
  locale: string
): DateFieldValues | null {
  text = text.replace(BIDI_ISOLATES, '').trim();
  if (!text) {
    return null;
  }

  let fields = parseISOText(text, state) ?? parseDisplayText(text, state, locale);
  if (!fields || !isValid(fields, state)) {
    return null;
  }

  return fields;
}

function parseISOText(text: string, state: DateFieldState): DateFieldValues | null {
  // Values with a time zone or offset are converted to the field's time zone. Fields without a time
  // zone are formatted in UTC internally, so use the user's local time zone for those instead.
  let timeZone = state.dateFormatter.resolvedOptions().timeZone;
  let isZoned =
    (state.value != null && 'timeZone' in state.value) ||
    state.segments.some(s => s.type === 'timeZoneName');
  if (!isZoned && timeZone === 'UTC') {
    timeZone = getLocalTimeZone();
  }

  let value: AnyDateTime | CalendarDate;
  try {
    if (/^[+-]?\d{4,6}-\d\d-\d\d$/.test(text)) {
      value = parseDate(text);
    } else if (/^\d\d:\d\d(:\d\d(\.\d+)?)?$/.test(text)) {
      let time = parseTime(text);
      return {hour: time.hour, minute: time.minute, second: time.second};
    } else if (/^[+-]?\d{4,6}-\d\d-\d\dT/.test(text)) {
      if (text.endsWith(']')) {
        value = toTimeZone(parseZonedDateTime(text), timeZone);
      } else if (/(?:Z|[+-]\d\d(?::?\d\d)?)$/i.test(text)) {
        value = parseAbsolute(text, timeZone);
      } else {
        value = parseDateTime(text);
      }
    } else {
      return null;
    }
  } catch {
    return null;
  }

  let date = toCalendar(value as CalendarDate, state.calendar) as
    | AnyDateTime
    | CalendarDate
    | ZonedDateTime;
  let fields: DateFieldValues = {
    era: date.era,
    year: date.year,
    month: date.month,
    day: date.day
  };
  if ('hour' in date) {
    fields.hour = date.hour;
    fields.minute = date.minute;
    fields.second = date.second;
  }
  // Keep the offset so ambiguous times (e.g. during a daylight saving time transition) resolve
  // to the pasted instant.
  if ('offset' in date) {
    fields.offset = date.offset;
  }

  return fields;
}

function parseDisplayText(
  text: string,
  state: DateFieldState,
  locale: string
): DateFieldValues | null {
  let parser = new NumberParser(locale, {maximumFractionDigits: 0});
  let fields: DateFieldValues = {};
  let dayPeriod: number | null = null;
  let pos = 0;

  for (let segment of state.segments) {
    if (segment.type === 'literal') {
      // Separators are skipped below, but literals can also contain localized text that must be
      // consumed, e.g. the "г." after the year in bg-BG.
      let literal = segment.text.replace(/[^\p{L}\p{Nd}]/gu, '');
      let end = literal ? matchLoose(text, skipSeparators(text, pos), literal) : -1;
      if (end >= 0) {
        pos = end;
      }
      continue;
    }

    pos = skipSeparators(text, pos);
    if (segment.type === 'timeZoneName') {
      // The time zone is not editable, so skip over it if it was included.
      let match = /^[\p{L}\p{Nd}+\-:/_]+/u.exec(text.slice(pos));
      if (match && /\p{L}/u.test(match[0])) {
        pos += match[0].length;
      }
      continue;
    }

    if (!segment.isEditable) {
      continue;
    }

    if (NUMERIC_SEGMENTS.has(segment.type)) {
      let match = /^\p{Nd}+/u.exec(text.slice(pos));
      if (!match) {
        return null;
      }

      let value = parser.parse(match[0]);
      if (isNaN(value)) {
        return null;
      }

      fields[segment.type] = value;
      pos += match[0].length;
    } else if (segment.type === 'dayPeriod') {
      let periods = getDayPeriods(locale);
      for (let i = 0; i < periods.length; i++) {
        let end = matchLoose(text, pos, periods[i]);
        if (end >= 0) {
          dayPeriod = i % 2;
          pos = end;
          break;
        }
      }
    } else if (segment.type === 'era') {
      for (let era of state.calendar.getEras()) {
        let end = matchLoose(text, pos, getEraName(era, state));
        if (end >= 0) {
          fields.era = era;
          pos = end;
          break;
        }
      }
    }
  }

  if (skipSeparators(text, pos) !== text.length) {
    return null;
  }

  if (fields.hour != null) {
    let hourCycle = state.dateFormatter.resolvedOptions().hourCycle;
    if (dayPeriod != null) {
      let [minHour, maxHour] = hourCycle === 'h11' ? [0, 11] : [1, 12];
      if (fields.hour < minHour || fields.hour > maxHour) {
        return null;
      }
      fields.hour = (fields.hour % 12) + dayPeriod * 12;
    } else if (hourCycle === 'h24') {
      if (fields.hour < 1 || fields.hour > 24) {
        return null;
      }
      fields.hour -= 1;
    }
    // Without a day period, the hour is treated as 24 hour time (e.g. 14:30 in a 12 hour field).
  }

  return fields;
}

function isValid(fields: DateFieldValues, state: DateFieldState): boolean {
  let {hour, minute, second} = fields;
  if (
    (hour != null && (hour < 0 || hour > 23)) ||
    (minute != null && (minute < 0 || minute > 59)) ||
    (second != null && (second < 0 || second > 59))
  ) {
    return false;
  }

  // Make sure the date exists, e.g. reject February 30th rather than silently constraining it.
  if (fields.year != null && fields.month != null && fields.day != null) {
    let date = fields.era
      ? new CalendarDate(state.calendar, fields.era, fields.year, fields.month, fields.day)
      : new CalendarDate(state.calendar, fields.year, fields.month, fields.day);
    if (date.year !== fields.year || date.month !== fields.month || date.day !== fields.day) {
      return false;
    }
  }

  // At least one of the displayed segments must be set (e.g. a time pasted into a date-only field is ignored).
  return state.segments.some(
    s => s.isEditable && s.type !== 'dayPeriod' && fields[s.type as keyof DateFieldValues] != null
  );
}

function skipSeparators(text: string, pos: number): number {
  while (pos < text.length && !/[\p{L}\p{Nd}]/u.test(text[pos])) {
    pos++;
  }
  return pos;
}

/**
 * Matches a localized string (e.g. "PM" or "p. m.") at the given position, ignoring case,
 * whitespace and periods. Returns the end position of the match, or -1.
 */
function matchLoose(text: string, pos: number, candidate: string): number {
  let expected = candidate.toLowerCase().replace(/[\s.]/g, '');
  if (!expected) {
    return -1;
  }

  let i = pos;
  let j = 0;
  while (j < expected.length && i < text.length) {
    let char = text[i];
    if (/[\s.]/.test(char)) {
      i++;
      continue;
    }
    if (char.toLowerCase() !== expected[j]) {
      return -1;
    }
    i++;
    j++;
  }

  if (j < expected.length || (i < text.length && /\p{L}/u.test(text[i]))) {
    return -1;
  }

  return i;
}

/** Returns the localized am and pm strings, followed by their English equivalents. */
function getDayPeriods(locale: string): string[] {
  let formatter = new DateFormatter(locale, {hour: 'numeric', hour12: true});
  let periods = [0, 12].map(hour => {
    let date = new Date(2020, 0, 1, hour);
    return formatter.formatToParts(date).find(part => part.type === 'dayPeriod')?.value ?? '';
  });
  return [...periods, 'am', 'pm'];
}

function getEraName(era: string, state: DateFieldState): string {
  let date = toCalendar(new CalendarDate(2020, 6, 15), state.calendar).set({
    era,
    year: 2,
    month: 6,
    day: 15
  });
  let parts = state.dateFormatter.formatToParts(date.toDate('UTC'));
  return parts.find(part => part.type === 'era')?.value ?? era;
}
