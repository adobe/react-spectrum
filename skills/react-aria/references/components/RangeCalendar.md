# Range

Calendar

RangeCalendars display a grid of days in one or more months and allow users to select a contiguous range of dates.

## Vanilla 

CSS example

### Range

Calendar.tsx

```tsx
'use client';
import {
  CalendarCell as AriaCalendarCell,
  DateValue,
  Heading,
  RangeCalendar as AriaRangeCalendar,
  RangeCalendarProps as AriaRangeCalendarProps,
  Text,
  composeRenderProps,
  CalendarCellProps
} from 'react-aria-components';
import {Button} from './Button';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {CalendarGrid} from './Calendar';
import './RangeCalendar.css';

export interface RangeCalendarProps<T extends DateValue>
  extends AriaRangeCalendarProps<T> {
  errorMessage?: string;
}

export function RangeCalendar<T extends DateValue>(
  { errorMessage, ...props }: RangeCalendarProps<T>
) {
  return (
    (
      <AriaRangeCalendar {...props}>
        <header>
          <Button slot="previous" variant="quiet"><ChevronLeft size={18} /></Button>
          <Heading />
          <Button slot="next" variant="quiet"><ChevronRight size={18} /></Button>
        </header>
        <CalendarGrid>
          {(date) => <CalendarCell date={date} />}
        </CalendarGrid>
        {errorMessage && <Text slot="errorMessage">{errorMessage}</Text>}
      </AriaRangeCalendar>
    )
  );
}


export {CalendarGrid};
export function CalendarCell(props: CalendarCellProps) {
  return (
    <AriaCalendarCell {...props}>
      {composeRenderProps(props.children, (children, {defaultChildren, isHovered, isPressed, isSelectionStart, isSelectionEnd, isDisabled}) => 
        <span
          className="button-base"
          data-variant="quiet"
          data-hovered={isHovered || undefined}
          data-pressed={isPressed || undefined}
          data-selected={isSelectionStart || isSelectionEnd || undefined}
          data-disabled={isDisabled || undefined}>
          {children || defaultChildren}
        </span>
      )}
    </AriaCalendarCell>
  );
}

```

### Range

Calendar.css

```css
@import "./theme.css";

.react-aria-RangeCalendar {
  width: calc(var(--spacing-9) * 7);
  max-width: 100%;
  container-type: inline-size;
  font: var(--font-size) system-ui;
  color: var(--text-color);

  header {
    display: flex;
    align-items: center;
    margin: 0 var(--spacing-1) var(--spacing-4) var(--spacing-1);

    .react-aria-Heading {
      flex: 1;
      margin: 0;
      text-align: center;
      font-size: var(--font-size-lg);
    }
  }

  .react-aria-CalendarGrid {
    border-collapse: collapse;
    border-spacing: 0;
  }

  [slot=errorMessage] {
    font-size: var(--font-size-sm);
    color: var(--invalid-color);
  }

  .react-aria-CalendarCell {
    margin: 2px 0;
    padding: 0 calc(var(--gap) / 2);
    position: relative;
    z-index: 1;

    span {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      border-radius: 9999px;
      transition: scale 200ms;
    }

    &[data-selected] {
      border-radius: 0;
      background: var(--button-background);
      border-color: var(--tint-700);
      border-style: solid;
      border-width: 0;
      border-top-width: 0.5px;
      border-bottom-width: 0.5px;
      margin: 1.5px 0;

      @media (forced-colors: active) {
        border-color: Highlight;
      }

      &[data-selection-start],
      &:is(td:first-child > *, [aria-disabled] + td > *)  {
        border-start-start-radius: 9999px;
        border-end-start-radius: 9999px;
        border-inline-start-width: 0.5px;
        margin-inline-start: calc(var(--gap) / 2 - 0.5px);
        padding-inline-start: 0;
      }

      &[data-selection-end],
      &:is(td:last-child > *, td:has(+ [aria-disabled]) > *) {
        border-end-end-radius: 9999px;
        border-start-end-radius: 9999px;
        border-inline-end-width: 0.5px;
        margin-inline-end: calc(var(--gap) / 2 - 0.5px);
        padding-inline-end: 0;
      }

      &[data-selection-start],
      &[data-selection-end] {
        z-index: 2;
      }

      &:not([data-selection-start], [data-selection-end]) span {
        color: var(--tint-1200);
        @media (forced-colors: active) {
          color: ButtonText;
        }
      }
    }

    &[data-pressed] {
      scale: 1;
      span {
        scale: 0.9;
      }
    }

    &[data-focus-visible] {
      outline: none;
      z-index: 2;
      span {
        outline: 2px solid var(--focus-ring-color);
        outline-offset: 2px;
      }
    }
  }
}

```

## Tailwind example

### Range

Calendar.tsx

```tsx
'use client';
import React from 'react';
import {
  RangeCalendar as AriaRangeCalendar,
  RangeCalendarProps as AriaRangeCalendarProps,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  DateValue,
  Text
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { CalendarGridHeader, CalendarHeader } from './Calendar';
import { composeTailwindRenderProps, focusRing } from './utils';

export interface RangeCalendarProps<T extends DateValue> extends Omit<AriaRangeCalendarProps<T>, 'visibleDuration'> {
  errorMessage?: string;
}

const cell = tv({
  extend: focusRing,
  base: 'w-full h-full flex items-center justify-center rounded-full forced-color-adjust-none text-neutral-900 dark:text-neutral-200',
  variants: {
    selectionState: {
      'none': 'group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 group-pressed:bg-neutral-300 dark:group-pressed:bg-neutral-600',
      'middle': [
        'group-hover:bg-blue-200 dark:group-hover:bg-blue-900 forced-colors:group-hover:bg-[Highlight]',
        'group-invalid:group-hover:bg-red-200 dark:group-invalid:group-hover:bg-red-900 forced-colors:group-invalid:group-hover:bg-[Mark]',
        'group-pressed:bg-blue-300 dark:group-pressed:bg-blue-800 forced-colors:group-pressed:bg-[Highlight] forced-colors:text-[HighlightText]',
        'group-invalid:group-pressed:bg-red-300 dark:group-invalid:group-pressed:bg-red-800 forced-colors:group-invalid:group-pressed:bg-[Mark]',
      ],
      'cap': 'bg-blue-600 group-invalid:bg-red-600 forced-colors:bg-[Highlight] forced-colors:group-invalid:bg-[Mark] text-white forced-colors:text-[HighlightText]'
    },
    isDisabled: {
      true: 'text-neutral-300 dark:text-neutral-600 forced-colors:text-[GrayText]'
    }
  }
});

export function RangeCalendar<T extends DateValue>(
  { errorMessage, ...props }: RangeCalendarProps<T>
) {
  return (
    <AriaRangeCalendar {...props} className={composeTailwindRenderProps(props.className, 'font-sans w-[calc(9*var(--spacing)*7)] max-w-full @container')}>
      <CalendarHeader />
      <CalendarGrid className="[&_td]:px-0 [&_td]:py-px border-spacing-0">
        <CalendarGridHeader />
        <CalendarGridBody>
          {(date) => <CalendarCell date={date} className="group w-[calc(100cqw/7)] aspect-square text-sm outline outline-0 cursor-default outside-month:text-neutral-300 selected:bg-blue-100 dark:selected:bg-blue-700/30 forced-colors:selected:bg-[Highlight] invalid:selected:bg-red-100 dark:invalid:selected:bg-red-700/30 forced-colors:invalid:selected:bg-[Mark] [td:first-child_&]:rounded-s-full selection-start:rounded-s-full [td:last-child_&]:rounded-e-full selection-end:rounded-e-full [-webkit-tap-highlight-color:transparent]">
            {({formattedDate, isSelected, isSelectionStart, isSelectionEnd, isFocusVisible, isDisabled}) =>
              <span
                className={cell({
                  selectionState: isSelected && (isSelectionStart || isSelectionEnd) ? 'cap' : isSelected ? 'middle' : 'none',
                  isDisabled,
                  isFocusVisible
                })}>
                {formattedDate}
              </span>
            }
          </CalendarCell>}
        </CalendarGridBody>
      </CalendarGrid>
      {errorMessage && <Text slot="errorMessage" className="text-sm text-red-600">{errorMessage}</Text>}
    </AriaRangeCalendar>
  );
}

```

## Value

Use the `value` or `defaultValue` prop to set the selected date range, using objects in the [@internationalized/date](internationalized/date/.md) package. This library supports parsing date strings in multiple formats, manipulation across international calendar systems, time zones, etc.

```tsx
import {parseDate, getLocalTimeZone} from '@internationalized/date';
import {useDateFormatter} from 'react-aria';
import {RangeCalendar} from 'vanilla-starter/RangeCalendar';
import {useState} from 'react';

function Example() {
  let [range, setRange] = useState({
    start: parseDate('2025-02-03'),
    end: parseDate('2025-02-12')
  });
  let formatter = useDateFormatter({ dateStyle: 'long' });

  return (
    <>
      <RangeCalendar
        value={range}
        onChange={setRange}
      />
      <p>Selected range: {formatter.formatRange(
        range.start.toDate(getLocalTimeZone()),
        range.end.toDate(getLocalTimeZone())
      )}</p>
    </>
  );
}
```

### International calendars

By default, `RangeCalendar` displays the value using the calendar system for the user's locale. Use `<I18nProvider>` to override the calendar system by setting the [Unicode calendar locale extension](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/calendar#adding_a_calendar_in_the_locale_string). The `onChange` event always receives a date in the same calendar as the `value` or `defaultValue` (Gregorian if no value is provided), regardless of the displayed locale.

```tsx
import {I18nProvider} from 'react-aria-components';
import {parseDate} from '@internationalized/date';
import {RangeCalendar} from 'vanilla-starter/RangeCalendar';

<I18nProvider>
  <RangeCalendar
    defaultValue={{
      start: parseDate('2025-02-03'),
      end: parseDate('2025-02-12')
    }} />
</I18nProvider>
```

### Custom calendar systems

`RangeCalendar` also supports custom calendar systems that implement custom business rules, for example a fiscal year calendar that follows a [4-5-4 format](https://nrf.com/resources/4-5-4-calendar), where month ranges don't follow the usual Gregorian calendar. See the [@internationalized/date docs](internationalized/date/Calendar.md#custom-calendars) for an example implementation.

```tsx
import type {AnyCalendarDate, Calendar} from '@internationalized/date';
import {CalendarDate, startOfWeek, GregorianCalendar} from '@internationalized/date';
import {RangeCalendar} from 'vanilla-starter/RangeCalendar';

export default function Example() {
  return (
    <RangeCalendar
      firstDayOfWeek="sun"
      createCalendar={() => new Custom454()} />
  );
}

// See @internationalized/date docs linked above.
class Custom454 extends GregorianCalendar {
  // The anchor date, in Gregorian calendar.
  // The anchor date is a date that occurs in the first week of the first month of every fiscal year.
  anchorDate = new CalendarDate(2001, 2, 4);

  private getYear(year: number): [CalendarDate, number[]] {
    let anchor = this.anchorDate.set({year});
    let startOfYear = startOfWeek(anchor, 'en', 'sun');
    let isBigYear = !startOfYear.add({weeks: 53}).compare(anchor.add({years: 1}));
    let weekPattern = [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, isBigYear ? 5 : 4];
    return [startOfYear, weekPattern];
  }

  getDaysInMonth(date: AnyCalendarDate): number {
    let [, weekPattern] = this.getYear(date.year);
    return weekPattern[date.month - 1] * 7;
  }

  fromJulianDay(jd: number): CalendarDate {
    let gregorian = super.fromJulianDay(jd);
    let year = gregorian.year;

    let [monthStart, weekPattern] = this.getYear(year);
    if (gregorian.compare(monthStart) < 0) {
      year--;
      [monthStart, weekPattern] = this.getYear(year);
    }

    for (let month = 1; month <= 12; month++) {
      let weeks = weekPattern[month - 1];
      let nextMonth = monthStart.add({weeks});
      if (nextMonth.compare(gregorian) > 0) {
        let days = gregorian.compare(monthStart);
        return new CalendarDate(this, year, month, days + 1);
      }
      monthStart = nextMonth;
    }

    throw new Error('date not found');
  }

  toJulianDay(date: AnyCalendarDate): number {
    let [monthStart, weekPattern] = this.getYear(date.year);
    for (let month = 1; month < date.month; month++) {
      monthStart = monthStart.add({weeks: weekPattern[month - 1]});
    }

    let gregorian = monthStart.add({days: date.day - 1});
    return super.toJulianDay(gregorian);
  }

  getFormattableMonth(date: AnyCalendarDate): CalendarDate {
    let anchorMonth = this.anchorDate.month - 1;
    let dateMonth = date.month - 1;
    let month = ((anchorMonth + dateMonth) % 12) + 1;
    let year = anchorMonth + dateMonth >= 12 ? date.year + 1 : date.year;
    return new CalendarDate(year, month, 1);
  }

  isEqual(other: Calendar): boolean {
    return other instanceof Custom454 && other.anchorDate.compare(this.anchorDate) === 0;
  }
}
```

## Validation

Use the `minValue` and `maxValue` props to set the valid date range. The `isDateUnavailable` callback prevents certain dates from being selected. Use `allowsNonContiguousRanges` to allow selecting ranges containing unavailable dates. For custom validation rules, set the `isInvalid` prop and the `errorMessage` slot.

```tsx
import {today, getLocalTimeZone} from '@internationalized/date';
import {RangeCalendar} from 'vanilla-starter/RangeCalendar';
import {useState} from 'react';

function Example(props) {
  let now = today(getLocalTimeZone());
  let [range, setRange] = useState({
    start: now.add({days: 6}),
    end: now.add({ days: 14 })
  });
  let disabledRanges = [
    [now, now.add({ days: 5 })],
    [now.add({ days: 15 }), now.add({ days: 17 })],
    [now.add({ days: 23 }), now.add({ days: 24 })]
  ];
  let isInvalid = range.end.compare(range.start) > 7;

  return (
    <RangeCalendar
      {...props}
      aria-label="Trip dates"
      value={range}
      onChange={setRange}
      
      minValue={today(getLocalTimeZone())}
      isDateUnavailable={date => (
        disabledRanges.some((interval) =>
          date.compare(interval[0]) >= 0 && date.compare(interval[1]) <= 0
        )
      )}
      isInvalid={isInvalid}
      errorMessage={isInvalid ? 'Maximum stay duration is 1 week' : undefined} />
  );
}
```

## Display options

Set the `visibleDuration` prop and render multiple `CalendarGrid` elements to display more than one month at a time. The `pageBehavior` prop controls whether pagination advances by a single month or multiple. The `firstDayOfWeek` prop overrides the locale-specified first day of the week.

```tsx
import {RangeCalendar, Heading} from 'react-aria-components';
import {CalendarGrid, CalendarCell} from 'vanilla-starter/RangeCalendar';
import {Button} from 'vanilla-starter/Button';
import {useDateFormatter} from 'react-aria';
import {ChevronLeft, ChevronRight} from 'lucide-react';

// TODO: move this into the starter example.
function Example(props) {
  let monthFormatter = useDateFormatter({
    month: 'long',
    year: 'numeric',
  });

  return (
    <RangeCalendar
      {...props}
      aria-label="Trip dates"
      
      style={{display: 'flex', gap: 12, overflow: 'auto'}}
    >
      {({state}) => (
        [...Array(props.visibleDuration.months).keys()].map(i => (
          <div key={i} style={{flex: 1}}>
            <header style={{minHeight: 32}}>
              {i === 0 &&
                <Button slot="previous" variant="quiet">
                  <ChevronLeft />
                </Button>
              }
              <Heading>{monthFormatter.format(state.visibleRange.start.add({months: i}).toDate(state.timeZone))}</Heading>
              {i === props.visibleDuration.months - 1 &&
                <Button slot="next" variant="quiet">
                  <ChevronRight />
                </Button>
              }
            </header>
            <CalendarGrid offset={{months: i}}>
              {date => <CalendarCell date={date} />}
            </CalendarGrid>
          </div>
        ))
      )}
    </RangeCalendar>
  );
}
```

## Controlling the focused date

Use the `focusedValue` or `defaultFocusedValue` prop to control which date is focused. This controls which month is visible. The `onFocusChange` event is called when a date is focused by the user.

```tsx
import {RangeCalendar} from 'vanilla-starter/RangeCalendar';
import {Button} from 'vanilla-starter/Button';
import {CalendarDate, today, getLocalTimeZone} from '@internationalized/date';
import {useState} from 'react';

function Example() {
  let defaultDate = new CalendarDate(2021, 7, 1);
  let [focusedDate, setFocusedDate] = useState(defaultDate);

  return (
    <div>
      <Button
        style={{marginBottom: 20}}
        onPress={() => setFocusedDate(today(getLocalTimeZone()))}>
        Today
      </Button>
      <RangeCalendar
        focusedValue={focusedDate}
        onFocusChange={setFocusedDate}
      />
    </div>
  );
}
```

### Month and year pickers

You can also control the focused date via `CalendarStateContext`. This example shows month and year dropdown components that work inside any `<RangeCalendar>`.

```tsx
import {RangeCalendar} from 'react-aria-components';
import {CalendarGrid, CalendarCell} from 'vanilla-starter/RangeCalendar';
import {MonthDropdown} from './MonthDropdown';
import {YearDropdown} from './YearDropdown';
import {Button} from 'vanilla-starter/Button';
import {ChevronLeft, ChevronRight} from 'lucide-react';

<RangeCalendar>
  <header style={{display: 'flex', gap: 4}}>
    <Button slot="previous" variant="quiet">
      <ChevronLeft />
    </Button>
    {/*- begin highlight -*/}
    <MonthDropdown />
    <YearDropdown />
    {/*- end highlight -*/}
    <Button slot="next" variant="quiet">
      <ChevronRight />
    </Button>
  </header>
  <CalendarGrid>
    {(date) => <CalendarCell date={date} />}
  </CalendarGrid>
</RangeCalendar>
```

## A

PI

```tsx
<RangeCalendar>
  <Button slot="previous" />
  <Heading />
  <Button slot="next" />
  <CalendarGrid>
    <CalendarGridHeader>
      {day => <CalendarHeaderCell />}
    </CalendarGridHeader>
    <CalendarGridBody>
      {date => <CalendarCell date={date} />}
    </CalendarGridBody>
  </CalendarGrid>
  <Text slot="errorMessage" />
</RangeCalendar>
```

### Range

Calendar

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `allowsNonContiguousRanges` | `boolean | undefined` | — | When combined with `isDateUnavailable`, determines whether non-contiguous ranges, i.e. ranges containing unavailable dates, may be selected. |
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoFocus` | `boolean | undefined` | false | Whether to automatically focus the calendar when it mounts. |
| `createCalendar` | `((identifier: CalendarIdentifier) => Calendar) | undefined` | — | A function to create a new [Calendar](https://react-spectrum.adobe.com/internationalized/date/Calendar.html) object for a given calendar identifier. If not provided, the `createCalendar` function from `@internationalized/date` will be used. |
| `defaultFocusedValue` | `DateValue | null | undefined` | — | The date that is focused when the calendar first mounts (uncontrolled). |
| `defaultValue` | `RangeValue<T> | null | undefined` | — | The default value (uncontrolled). |
| `errorMessage` | `ReactNode` | — | The error message to display when the calendar is invalid. |
| `firstDayOfWeek` | `"sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | undefined` | — | The day that starts the week. |
| `focusedValue` | `DateValue | null | undefined` | — | Controls the currently focused date within the calendar. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isDateUnavailable` | `((date: DateValue) => boolean) | undefined` | — | Callback that is called for each date of the calendar. If it returns true, then the date is unavailable. |
| `isDisabled` | `boolean | undefined` | false | Whether the calendar is disabled. |
| `isInvalid` | `boolean | undefined` | — | Whether the current selection is invalid according to application logic. |
| `isReadOnly` | `boolean | undefined` | false | Whether the calendar value is immutable. |
| `maxValue` | `DateValue | null | undefined` | — | The maximum allowed date that a user may select. |
| `minValue` | `DateValue | null | undefined` | — | The minimum allowed date that a user may select. |
| `onChange` | `((value: RangeValue<MappedDateValue<T>>) => void) | undefined` | — | Handler that is called when the value changes. |
| `onFocusChange` | `((date: CalendarDate) => void) | undefined` | — | Handler that is called when the focused date changes. |
| `pageBehavior` | `PageBehavior | undefined` | visible | Controls the behavior of paging. Pagination either works by advancing the visible page by visibleDuration (default) or one unit of visibleDuration. |
| `selectionAlignment` | `"start" | "center" | "end" | undefined` | 'center' | Determines the alignment of the visible months on initial render based on the current selection or current date if there is no selection. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `value` | `RangeValue<T> | null | undefined` | — | The current value (controlled). |
| `visibleMonths` | `number | undefined` | 1 | The number of months to display at once. |

### Calendar

Grid

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>[] | ((date: CalendarDate) => ReactElement) | undefined` | — | Either a function to render calendar cells for each date in the month, or children containing a `<CalendarGridHeader>`` and `<CalendarGridBody>`when additional customization is needed. |
|`className`|`string | undefined`| 'react-aria-CalendarGrid' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. |
|`dir`|`string | undefined`| — |  |
|`hidden`|`boolean | undefined`| — |  |
|`inert`|`boolean | undefined`| — |  |
|`lang`|`string | undefined`| — |  |
|`offset`|`DateDuration | undefined`| — | An offset from the beginning of the visible date range that this CalendarGrid should display. Useful when displaying more than one month at a time. |
|`onAnimationEnd`|`React.AnimationEventHandler<HTMLTableElement> | undefined`| — |  |
|`onAnimationEndCapture`|`React.AnimationEventHandler<HTMLTableElement> | undefined`| — |  |
|`onAnimationIteration`|`React.AnimationEventHandler<HTMLTableElement> | undefined`| — |  |
|`onAnimationIterationCapture`|`React.AnimationEventHandler<HTMLTableElement> | undefined`| — |  |
|`onAnimationStart`|`React.AnimationEventHandler<HTMLTableElement> | undefined`| — |  |
|`onAnimationStartCapture`|`React.AnimationEventHandler<HTMLTableElement> | undefined`| — |  |
|`onAuxClick`|`React.MouseEventHandler<HTMLTableElement> | undefined`| — |  |
|`onAuxClickCapture`|`React.MouseEventHandler<HTMLTableElement> | undefined`| — |  |
|`onClick`|`React.MouseEventHandler<HTMLTableElement> | undefined`| — |  |
|`onClickCapture`|`React.MouseEventHandler<HTMLTableElement> | undefined`| — |  |
|`onContextMenu`|`React.MouseEventHandler<HTMLTableElement> | undefined`| — |  |
|`onContextMenuCapture`|`React.MouseEventHandler<HTMLTableElement> | undefined`| — |  |
|`onDoubleClick`|`React.MouseEventHandler<HTMLTableElement> | undefined`| — |  |
|`onDoubleClickCapture`|`React.MouseEventHandler<HTMLTableElement> | undefined`| — |  |
|`onGotPointerCapture`|`React.PointerEventHandler<HTMLTableElement> | undefined`| — |  |
|`onGotPointerCaptureCapture`|`React.PointerEventHandler<HTMLTableElement> | undefined`| — |  |
|`onLostPointerCapture`|`React.PointerEventHandler<HTMLTableElement> | undefined`| — |  |
|`onLostPointerCaptureCapture`|`React.PointerEventHandler<HTMLTableElement> | undefined`| — |  |
|`onMouseDown`|`React.MouseEventHandler<HTMLTableElement> | undefined`| — |  |
|`onMouseDownCapture`|`React.MouseEventHandler<HTMLTableElement> | undefined`| — |  |
|`onMouseEnter`|`React.MouseEventHandler<HTMLTableElement> | undefined`| — |  |
|`onMouseLeave`|`React.MouseEventHandler<HTMLTableElement> | undefined`| — |  |
|`onMouseMove`|`React.MouseEventHandler<HTMLTableElement> | undefined`| — |  |
|`onMouseMoveCapture`|`React.MouseEventHandler<HTMLTableElement> | undefined`| — |  |
|`onMouseOut`|`React.MouseEventHandler<HTMLTableElement> | undefined`| — |  |
|`onMouseOutCapture`|`React.MouseEventHandler<HTMLTableElement> | undefined`| — |  |
|`onMouseOver`|`React.MouseEventHandler<HTMLTableElement> | undefined`| — |  |
|`onMouseOverCapture`|`React.MouseEventHandler<HTMLTableElement> | undefined`| — |  |
|`onMouseUp`|`React.MouseEventHandler<HTMLTableElement> | undefined`| — |  |
|`onMouseUpCapture`|`React.MouseEventHandler<HTMLTableElement> | undefined`| — |  |
|`onPointerCancel`|`React.PointerEventHandler<HTMLTableElement> | undefined`| — |  |
|`onPointerCancelCapture`|`React.PointerEventHandler<HTMLTableElement> | undefined`| — |  |
|`onPointerDown`|`React.PointerEventHandler<HTMLTableElement> | undefined`| — |  |
|`onPointerDownCapture`|`React.PointerEventHandler<HTMLTableElement> | undefined`| — |  |
|`onPointerEnter`|`React.PointerEventHandler<HTMLTableElement> | undefined`| — |  |
|`onPointerLeave`|`React.PointerEventHandler<HTMLTableElement> | undefined`| — |  |
|`onPointerMove`|`React.PointerEventHandler<HTMLTableElement> | undefined`| — |  |
|`onPointerMoveCapture`|`React.PointerEventHandler<HTMLTableElement> | undefined`| — |  |
|`onPointerOut`|`React.PointerEventHandler<HTMLTableElement> | undefined`| — |  |
|`onPointerOutCapture`|`React.PointerEventHandler<HTMLTableElement> | undefined`| — |  |
|`onPointerOver`|`React.PointerEventHandler<HTMLTableElement> | undefined`| — |  |
|`onPointerOverCapture`|`React.PointerEventHandler<HTMLTableElement> | undefined`| — |  |
|`onPointerUp`|`React.PointerEventHandler<HTMLTableElement> | undefined`| — |  |
|`onPointerUpCapture`|`React.PointerEventHandler<HTMLTableElement> | undefined`| — |  |
|`onScroll`|`React.UIEventHandler<HTMLTableElement> | undefined`| — |  |
|`onScrollCapture`|`React.UIEventHandler<HTMLTableElement> | undefined`| — |  |
|`onTouchCancel`|`React.TouchEventHandler<HTMLTableElement> | undefined`| — |  |
|`onTouchCancelCapture`|`React.TouchEventHandler<HTMLTableElement> | undefined`| — |  |
|`onTouchEnd`|`React.TouchEventHandler<HTMLTableElement> | undefined`| — |  |
|`onTouchEndCapture`|`React.TouchEventHandler<HTMLTableElement> | undefined`| — |  |
|`onTouchMove`|`React.TouchEventHandler<HTMLTableElement> | undefined`| — |  |
|`onTouchMoveCapture`|`React.TouchEventHandler<HTMLTableElement> | undefined`| — |  |
|`onTouchStart`|`React.TouchEventHandler<HTMLTableElement> | undefined`| — |  |
|`onTouchStartCapture`|`React.TouchEventHandler<HTMLTableElement> | undefined`| — |  |
|`onTransitionCancel`|`React.TransitionEventHandler<HTMLTableElement> | undefined`| — |  |
|`onTransitionCancelCapture`|`React.TransitionEventHandler<HTMLTableElement> | undefined`| — |  |
|`onTransitionEnd`|`React.TransitionEventHandler<HTMLTableElement> | undefined`| — |  |
|`onTransitionEndCapture`|`React.TransitionEventHandler<HTMLTableElement> | undefined`| — |  |
|`onTransitionRun`|`React.TransitionEventHandler<HTMLTableElement> | undefined`| — |  |
|`onTransitionRunCapture`|`React.TransitionEventHandler<HTMLTableElement> | undefined`| — |  |
|`onTransitionStart`|`React.TransitionEventHandler<HTMLTableElement> | undefined`| — |  |
|`onTransitionStartCapture`|`React.TransitionEventHandler<HTMLTableElement> | undefined`| — |  |
|`onWheel`|`React.WheelEventHandler<HTMLTableElement> | undefined`| — |  |
|`onWheelCapture`|`React.WheelEventHandler<HTMLTableElement> | undefined`| — |  |
|`style`|`React.CSSProperties | undefined`| — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. |
|`translate`|`"yes" | "no" | undefined`| — |  |
|`weekdayStyle`|`"narrow" | "short" | "long" | undefined\` | "narrow" | The style of weekday names to display in the calendar grid header, e.g. single letter, abbreviation, or full day name. |

### Calendar

GridHeader

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `(day: string) => ReactElement` | — | A function to render a `<CalendarHeaderCell>` for a weekday name. |
| `className` | `string | undefined` | 'react-aria-CalendarGridHeader' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `style` | `React.CSSProperties | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. |
| `translate` | `"yes" | "no" | undefined` | — |  |

### Calendar

HeaderCell

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | — | The children of the component. |
| `className` | `string | undefined` | 'react-aria-CalendarHeaderCell' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inert` | `boolean | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLTableHeaderCellElement> | undefined` | — |  |
| `style` | `React.CSSProperties | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. |
| `translate` | `"yes" | "no" | undefined` | — |  |

### Calendar

GridBody

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `(date: CalendarDate) => ReactElement` | — | A function to render a `<CalendarCell>` for a given date. |
| `className` | `string | undefined` | 'react-aria-CalendarGridBody' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLTableSectionElement> | undefined` | — |  |
| `style` | `React.CSSProperties | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. |
| `translate` | `"yes" | "no" | undefined` | — |  |

### Calendar

Cell

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ChildrenOrFunction<CalendarCellRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<CalendarCellRenderProps> | undefined` | 'react-aria-CalendarCell' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `date` | `CalendarDate` | — | The date to render in the cell. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onHoverChange` | `((isHovering: boolean) => void) | undefined` | — | Handler that is called when the hover state changes. |
| `onHoverEnd` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction ends. |
| `onHoverStart` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction starts. |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLTableCellElement> | undefined` | — |  |
| `style` | `(React.CSSProperties | ((values: CalendarCellRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |
