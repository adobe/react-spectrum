declare namespace Intl {

  type UnicodeBCP47LocaleIdentifier = string;

  type RelativeTimeFormatUnit =
    | 'year' | 'years'
    | 'quarter' | 'quarters'
    | 'month' | 'months'
    | 'week' | 'weeks'
    | 'day' | 'days'
    | 'hour' | 'hours'
    | 'minute' | 'minutes'
    | 'second' | 'seconds'
    ;

  type RelativeTimeFormatLocaleMatcher = 'lookup' | 'best fit';

  type RelativeTimeFormatNumeric = 'always' | 'auto';

  type RelativeTimeFormatStyle = 'long' | 'short' | 'narrow';

  interface RelativeTimeFormatOptions {
    localeMatcher?: RelativeTimeFormatLocaleMatcher,
    numeric?: RelativeTimeFormatNumeric,
    style?: RelativeTimeFormatStyle
  }

  interface ResolvedRelativeTimeFormatOptions {
    locale: UnicodeBCP47LocaleIdentifier,
    style: RelativeTimeFormatStyle,
    numeric: RelativeTimeFormatNumeric,
    numberingSystem: string
  }

  interface RelativeTimeFormatPart {
    type: string,
    value: string,
    unit?: RelativeTimeFormatUnit
  }

  interface RelativeTimeFormat {
    format(
      value: number,
      unit: RelativeTimeFormatUnit
    ): string,

    formatToParts(
      value: number,
      unit: RelativeTimeFormatUnit
    ): RelativeTimeFormatPart[],

    resolvedOptions(): ResolvedRelativeTimeFormatOptions
  }

  const RelativeTimeFormat: {
    new(
      locales?: UnicodeBCP47LocaleIdentifier | UnicodeBCP47LocaleIdentifier[],
      options?: RelativeTimeFormatOptions
    ): RelativeTimeFormat,

    supportedLocalesOf(
      locales?: UnicodeBCP47LocaleIdentifier | UnicodeBCP47LocaleIdentifier[],
      options?: RelativeTimeFormatOptions
    ): UnicodeBCP47LocaleIdentifier[]
  };

  interface NumberFormatOptions {
    compactDisplay?: string,
    notation?: string,
    signDisplay?: string,
    unit?: string,
    unitDisplay?: string
  }

  interface ResolvedNumberFormatOptions {
    compactDisplay?: string,
    currencySign?: string,
    notation?: string,
    signDisplay?: string,
    unit?: string,
    unitDisplay?: string
  }

  interface DateTimeFormatOptions {
    dateStyle?: 'full' | 'long' | 'medium' | 'short',
    timeStyle?: 'full' | 'long' | 'medium' | 'short',
    calendar?: string,
    dayPeriod?: 'narrow' | 'short' | 'long',
    numberingSystem?: string,
    hourCycle?: 'h11' | 'h12' | 'h23' | 'h24',
    fractionalSecondDigits?: 0 | 1 | 2 | 3
  }
}
