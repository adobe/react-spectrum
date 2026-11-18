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

let formatterCache = new Map<string, Intl.NumberFormat>();

export interface NumberFormatOptions extends Intl.NumberFormatOptions {
  /** Overrides default numbering system for the current locale. */
  numberingSystem?: string;
}

/**
 * A wrapper around Intl.NumberFormat providing additional options and caching for
 * performance.
 */
export class NumberFormatter implements Intl.NumberFormat {
  private numberFormatter: Intl.NumberFormat;

  constructor(locale: string, options: NumberFormatOptions = {}) {
    this.numberFormatter = getCachedNumberFormatter(locale, options);
  }

  /**
   * Formats a number value as a string, according to the locale and options provided to the
   * constructor.
   */
  format(value: number): string {
    return this.numberFormatter.format(value);
  }

  /** Formats a number to an array of parts such as separators, digits, punctuation, and more. */
  formatToParts(value: number): Intl.NumberFormatPart[] {
    return this.numberFormatter.formatToParts(value);
  }

  /** Formats a number range as a string. */
  formatRange(start: number, end: number): string {
    if (typeof this.numberFormatter.formatRange === 'function') {
      return this.numberFormatter.formatRange(start, end);
    }

    if (end < start) {
      throw new RangeError('End date must be >= start date');
    }

    // Very basic fallback for old browsers.
    return `${this.format(start)} – ${this.format(end)}`;
  }

  /** Formats a number range as an array of parts. */
  formatRangeToParts(start: number, end: number): Intl.NumberRangeFormatPart[] {
    if (typeof this.numberFormatter.formatRangeToParts === 'function') {
      return this.numberFormatter.formatRangeToParts(start, end);
    }

    if (end < start) {
      throw new RangeError('End date must be >= start date');
    }

    let startParts = this.numberFormatter.formatToParts(start);
    let endParts = this.numberFormatter.formatToParts(end);
    return [
      ...startParts.map(p => ({...p, source: 'startRange'}) as Intl.NumberRangeFormatPart),
      {type: 'literal', value: ' – ', source: 'shared'},
      ...endParts.map(p => ({...p, source: 'endRange'}) as Intl.NumberRangeFormatPart)
    ];
  }

  /** Returns the resolved formatting options based on the values passed to the constructor. */
  resolvedOptions(): Intl.ResolvedNumberFormatOptions {
    return this.numberFormatter.resolvedOptions();
  }
}

function getCachedNumberFormatter(
  locale: string,
  options: NumberFormatOptions = {}
): Intl.NumberFormat {
  let {numberingSystem} = options;
  if (numberingSystem && locale.includes('-nu-')) {
    if (!locale.includes('-u-')) {
      locale += '-u-';
    }
    locale += `-nu-${numberingSystem}`;
  }

  let cacheKey =
    locale +
    (options
      ? Object.entries(options)
          .sort((a, b) => (a[0] < b[0] ? -1 : 1))
          .join()
      : '');
  if (formatterCache.has(cacheKey)) {
    return formatterCache.get(cacheKey)!;
  }

  let numberFormatter = new Intl.NumberFormat(locale, options);
  formatterCache.set(cacheKey, numberFormatter);
  return numberFormatter;
}
