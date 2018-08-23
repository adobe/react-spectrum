import autobind from 'autobind-decorator';
import Button from '../../Button';
import ChevronLeftLarge from '../../Icon/core/ChevronLeftLarge';
import ChevronRightLarge from '../../Icon/core/ChevronRightLarge';
import classNames from 'classnames';
import createId from '../../utils/createId';
import {DateRange} from 'moment-range';
import filterDOMProps from '../../utils/filterDOMProps';
import {formatMoment, isDateInRange, toMoment} from '../../utils/moment';
import {getLocale, messageFormatter} from '../../utils/intl';
import intlMessages from '../intl/*.json';
import LiveRegionAnnouncer from '../../utils/LiveRegionAnnouncer';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import '../style/index.styl';
import '../../utils/style/index.styl';

importSpectrumCSS('calendar');

const formatMessage = messageFormatter(intlMessages);

@autobind
export default class Calendar extends Component {
  static displayName = 'Calendar';

  static propTypes = {
    /**
     * If focus should immediately be given to the calendar upon render.
     */
    autoFocus: PropTypes.bool,

    /**
     * A unique identifying string for forms.
     */
    id: PropTypes.string,

    /**
     * Formats the date string at the top of the calendar,
     */
    headerFormat: PropTypes.string,

    /**
     * Max date selectable, everything past it will be disabled. Can accept anything Moment understands.
     */
    max: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.number
    ]),

    /**
     * Min date selectable, everything past it will be disabled. Can accept anything Moment understands.
     */
    min: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.number
    ]),

    /**
     * Starting value. Can accept anything Moment understands. Causes component to be Controlled.
     */
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.number,
      PropTypes.array
    ]),

    /**
     * Format of the value that should be returned. Anything Moment understands.
     */
    valueFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    /**
     * Tells the calendar if the user can select a range or just a single day.
     */
    selectionType: PropTypes.oneOf(['single', 'range']),

    /**
     * Start day refers to what day of the week should be left most, 0 = Sunday, 1 = Monday...
     */
    startDay: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6]),

    /**
     * Disables the calendar, it cannot be interacted with and renders greyed out
     */
    disabled: PropTypes.bool,

    /**
     * Fill in.
     */
    readOnly: PropTypes.bool,

    /**
     * For forms.
     */
    required: PropTypes.bool,

    /**
     * Fill in.
     */
    invalid: PropTypes.bool,

    /**
     * Called when a date is selected or a range is selected
     * @callback Calendar~onChange
     * @param {Object} event - Moment object
     */
    onChange: PropTypes.func
  };

  static defaultProps = {
    autoFocus: false,
    headerFormat: 'MMMM YYYY',
    max: null,
    min: null,
    valueFormat: 'YYYY-MM-DD',
    selectionType: 'single',
    startDay: 0,
    disabled: false,
    invalid: false,
    readOnly: false,
    required: false,
    onChange: function () {}
  };

  constructor(props) {
    super(props);
    this.calendarId = createId();
  }

  componentWillMount() {
    const {
      value,
      defaultValue,
      min,
      max,
      valueFormat
    } = this.props;

    const newValue = toMoment(value || defaultValue || '', valueFormat);
    const newMin = toMoment(min, valueFormat);
    const newMax = toMoment(max, valueFormat);

    this.setState({
      isFocused: false,
      min: newMin && newMin.startOf('day'),
      max: newMax && newMax.startOf('day')
    });

    this.setSelected(newValue);
    this.setCurrentMonth(newValue);
  }

  componentDidMount() {
    if (this.props.autoFocus) {
      this.focus();
    }
  }

  componentWillReceiveProps(nextProps) {
    const {min, max, valueFormat} = this.props;

    if (min !== nextProps.min || valueFormat !== nextProps.valueFormat) {
      const newMin = toMoment(nextProps.min, nextProps.valueFormat);
      this.setState({
        min: newMin && newMin.startOf('day')
      });
    }

    if (max !== nextProps.max || valueFormat !== nextProps.valueFormat) {
      const newMax = toMoment(nextProps.max, nextProps.valueFormat);
      this.setState({
        max: newMax && newMax.startOf('day')
      });
    }

    if ('value' in nextProps && nextProps.value !== this.state.value) {
      const newValue = toMoment(nextProps.value, nextProps.valueFormat);

      // Only change the current month window if the next value is a different day than
      // what we currently have.  We don't want to trigger the month switch if we are just
      // changing the hours or minutes of the day.
      if (!newValue.isSame(this.state.value, 'day')) {
        this.setSelected(newValue);
        this.setCurrentMonth(newValue);
      }
    }
  }

  getRange(value) {
    if (value instanceof DateRange) {
      return value.clone();
    } else if (value) {
      return new DateRange(value.clone().startOf('day'), value.clone().endOf('day'));
    }

    return null;
  }

  setSelected(value) {
    let range = this.getRange(value);

    this.setState({
      value: this.props.selectionType === 'range' ? range : value,
      highlightedRange: range,
      focusedDate: range ? range.start : moment()
    });
  }

  setValue(value) {
    const {onChange} = this.props;

    if (this.props.selectionType === 'range') {
      value = this.getRange(value);
    } else {
      value = value.clone();
    }

    if (!('value' in this.props)) {
      this.setSelected(value);
      this.setCurrentMonth(value);
    }

    onChange(value);
  }

  setCurrentMonth(date, today = moment()) {
    if (date instanceof DateRange) {
      date = date.end;
    }

    const visibleMonth = date && date.isValid() ? date : today;

    this.setState({
      currentMonth: visibleMonth.clone().startOf('month')
    });
  }

  /**
   * Generates a unique id for a DOM element descendant
   * * @param   {Sting} string String value
   * @returns {String} A unique id
   */
  generateId(string) {
    const {id = this.calendarId} = this.props;

    return `${id}-${string}`;
  }

  /**
   * Generates a unique id for a Calendar table cell
   * @param   {Object} date Moment object
   * @returns {String} A unique id for the Calendar table cell
   */
  generateDateId(date) {
    return date ? this.generateId(date.format('YYYY/MM/DD')) : null;
  }

  /**
   * Handles click on previous arrow button to navigate to the previous month.
   */
  handleClickPrevious() {
    const {currentMonth, focusedDate} = this.state;

    // set focus to the appropriate date within the previous month
    if (focusedDate) {
      this.focusTimeUnit(focusedDate.clone().add(-1, 'month'));
    }

    this.setState({
      currentMonth: currentMonth.clone().add(-1, 'month').startOf('month')
    }, () => {
      // announce new currentMonth using a live region.
      this.announceCurrentMonth();

      // restore focus from the calendar body to the previous month button
      requestAnimationFrame(() => this.prevMonthButton.focus());
    });
  }

  /**
   * Handles click on next arrow button to navigate to the next month.
   */
  handleClickNext() {
    const {currentMonth, focusedDate} = this.state;

    // set focus to the appropriate date within the previous month
    if (focusedDate) {
      this.focusTimeUnit(focusedDate.clone().add(1, 'month'));
    }

    this.setState({
      currentMonth: currentMonth.clone().add(1, 'month').startOf('month')
    }, () => {
      this.announceCurrentMonth();

      // restore focus from the calendar body to the next month button
      requestAnimationFrame(() => this.nextMonthButton.focus());
    });
  }

  handleDayClick(e, date) {
    this.selectFocused(date);
  }

  handleDayMouseDown(e, date) {
    this.focusTimeUnit(date);
  }

  getSelectingRange(date) {
    let min = moment.min((this.state.anchorDate || this.state.focusedDate), date).clone();
    let max = moment.max((this.state.anchorDate || this.state.focusedDate), date).clone();
    return new DateRange(min, max);
  }

  onHighlight(e, date) {
    if (this.state.selectingRange) {
      this.setState({
        selectingRange: this.getSelectingRange(date)
      });
    }
  }

  onFocus(e) {
    this.setState({isFocused: true});
    if (this.props.onFocus) {
      this.props.onFocus(e);
    }
  }

  onBlur(e) {
    this.setState({isFocused: false});
    if (this.props.onBlur) {
      this.props.onBlur(e);
    }
  }

  handleKeyDown(e) {
    const {focusedDate} = this.state;
    const nextMoment = focusedDate.clone();

    switch (e.keyCode) {
      case 13: // enter
      case 32: // space
        e.preventDefault();
        this.selectFocused(nextMoment);
        break;
      case 33: // page up
        e.preventDefault();
        this.focusTimeUnit(nextMoment.subtract(1, e.metaKey ? 'year' : 'month'));
        break;
      case 34: // page down
        e.preventDefault();
        this.focusTimeUnit(nextMoment.add(1, e.metaKey ? 'year' : 'month'));
        break;
      case 35: // end
        e.preventDefault();
        this.focusTimeUnit(nextMoment.endOf('month').startOf('day'));
        break;
      case 36: // home
        e.preventDefault();
        this.focusTimeUnit(nextMoment.startOf('month').startOf('day'));
        break;
      case 37: // left arrow
        e.preventDefault();
        this.focusTimeUnit(nextMoment.subtract(1, 'day'));
        break;
      case 38: // up arrow
        e.preventDefault();
        this.focusTimeUnit(nextMoment.subtract(1, 'week'));
        break;
      case 39: // right arrow
        e.preventDefault();
        this.focusTimeUnit(nextMoment.add(1, 'day'));
        break;
      case 40: // down arrow
        e.preventDefault();
        this.focusTimeUnit(nextMoment.add(1, 'week'));
        break;
      case 27: // escape
        if (this.state.selectingRange) {
          this.setState({selectingRange: null, anchorDate: null});
        }
        break;
    }
  }

  focusTimeUnit(date) {
    const {currentMonth, min, max} = this.state;

    // Don't move focus if the date is not in range.
    if (!isDateInRange(date, min, max)) {
      return;
    }

    const sameMonthAsVisible = currentMonth.isSame(date, 'month');
    const newCurrentMonth = sameMonthAsVisible ? currentMonth : date.clone().startOf('month');

    this.setState({
      focusedDate: date,
      currentMonth: newCurrentMonth
    }, () => {
      // wait for render before highlighting the date range and focusing the Calendar body
      this.onHighlight(null, date);
      this.focusCalendarBody();

      if (!sameMonthAsVisible) {
        this.announceCurrentMonth('polite');
      }
    });
  }

  /**
   * Announces current month using a live region
   */
  announceCurrentMonth(assertiveness = 'assertive') {
    const method = assertiveness === 'polite' ? 'announcePolite' : 'announceAssertive';
    const {currentMonth} = this.state;
    currentMonth.locale(getLocale());
    LiveRegionAnnouncer[method](currentMonth.format(this.props.headerFormat));
  }

  /**
   * Announces selected date or selected range of dates
   */
  announceSelection(assertiveness = 'polite') {
    const selectedRangeDescription = this.getSelectedRangeDescription();
    if (selectedRangeDescription === '') {
      LiveRegionAnnouncer.clearMessage();
    } else {
      const method = assertiveness === 'polite' ? 'announcePolite' : 'announceAssertive';
      LiveRegionAnnouncer[method](selectedRangeDescription);
    }
  }

  getSelectedRangeDescription() {
    const {highlightedRange, anchorDate = false} = this.state;
    const isRangeSelection = this.props.selectionType === 'range';
    let selectedRangeDescription = '';

    // Provide localized description of selected date or range of dates.
    if (highlightedRange) {
      highlightedRange.start.locale(getLocale());
      if (isRangeSelection) {
        highlightedRange.end.locale(getLocale());
      }
      const start = highlightedRange.start.toDate();
      const end = isRangeSelection ? highlightedRange.end.toDate() : start;
      if (isRangeSelection && !anchorDate && start.valueOf() !== end.valueOf()) {
        selectedRangeDescription = formatMessage('selectedRangeDescription', {
          start,
          end
        });
      } else if (!anchorDate) {
        selectedRangeDescription = formatMessage('selectedDateDescription', {
          date: start
        });
      }
    }

    return selectedRangeDescription;
  }

  selectFocused(date) {
    const {value} = this.state;

    date = date.clone();
    if (value && moment.isMoment(value) && value.isValid()) {
      date.hour(value.hour());
      date.minute(value.minute());
      date.second(value.second());
      date.millisecond(value.millisecond());
    }

    let selectingRange = null;
    let anchorDate = null;
    let newValue = null;
    let assertiveness = 'polite';
    if (this.props.selectionType === 'range') {
      // If this is the second date selected, set the value.
      // Otherwise, setup the selecting range.
      if (this.state.selectingRange) {
        newValue = this.getSelectingRange(date);
      } else {
        selectingRange = this.getRange(date);
        anchorDate = date;
      }
    } else {
      newValue = date;
    }

    if (newValue) {
      assertiveness = 'assertive';
      this.setValue(newValue);
    }

    this.setState({
      anchorDate,
      focusedDate: date,
      selectingRange
    }, () => {
      // wait for render before setting focus to Calendar body
      this.focusCalendarBody();

      // announce newly selected date or range of dates
      this.announceSelection(assertiveness);
    });
  }

  /**
   * Focus calendar
   */
  focus() {
    this.focusCalendarBody();
  }

  /**
   * Ensure Calendar body receives focus after clicking on a cell
   */
  focusCalendarBody() {
    const calendarBody = this.calendarBody;
    if (calendarBody) {
      // this forces assistive technology to announce the current active descendant of the calendar body
      if (calendarBody === document.activeElement) {
        calendarBody.blur();
      }
      requestAnimationFrame(() => calendarBody.focus());
    }
  }

  renderTable(date) {
    const descriptionId = this.generateId('description');
    const selectedRangeDescription = this.getSelectedRangeDescription();

    return (
      <table
        key={date.format('MM/Y')}
        className="spectrum-Calendar-table">
        <caption className="u-react-spectrum-screenReaderOnly" id={descriptionId} >{selectedRangeDescription}</caption>
        {this.renderTableHeader()}
        {this.renderTableBody(date)}
      </table>
    );
  }

  renderTableHeader() {
    const {startDay} = this.props;

    return (
      <thead>
        <tr role="row">
          {
            [...new Array(7).keys()].map(index => {
              const dayMoment = moment().day((index + startDay) % 7);
              return (
                <th
                  key={index}
                  role="columnheader"
                  scope="col"
                  className="spectrum-Calendar-tableCell">
                  <abbr
                    className="spectrum-Calendar-dayOfWeek"
                    title={dayMoment.format('dddd')}>
                    {dayMoment.format('dd')}
                  </abbr>
                </th>
              );
            })
          }
        </tr>
      </thead>
    );
  }

  renderTableBody(date) {
    const {startDay, disabled} = this.props;
    const {highlightedRange, selectingRange, min, max, isFocused, focusedDate, currentMonth, anchorDate} = this.state;
    const range = selectingRange || highlightedRange;

    const month = date.month();
    const year = date.year();
    const dateFocusedLocal = focusedDate ? focusedDate.clone().startOf('day') : null;
    let monthStartsAt = (currentMonth.day() - startDay) % 7;

    if (monthStartsAt < 0) {
      monthStartsAt += 7;
    }

    return (
      <tbody>
        {
          [...new Array(6).keys()].map(weekIndex => (
            <tr key={weekIndex} role="row">
              {
                [...new Array(7).keys()].map(dayIndex => {
                  const day = (weekIndex * 7 + dayIndex) - monthStartsAt + 1;
                  const cursor = moment(new Date(year, month, day));
                  const isCurrentMonth = (cursor.month()) === parseFloat(month);
                  const cursorLocal = cursor.clone().startOf('day');
                  const isRangeStart = range && (dayIndex === 0 || day === 1);
                  const isRangeEnd = range && (dayIndex === 6 || day === cursor.daysInMonth());
                  const isSelectionStart = range && cursorLocal.isSame(range.start, 'day');
                  const isSelectionEnd = range && cursorLocal.isSame(range.end, 'day');
                  const isSelected = isSelectionStart || isSelectionEnd || (range && range.contains(cursorLocal));
                  const isRangeSelection = this.props.selectionType === 'range';
                  const isRangeSelected = isRangeSelection && range && !anchorDate;
                  const isRangeSelectionInProgress = isRangeSelection && anchorDate;

                  return (
                    <CalendarCell
                      key={dayIndex}
                      id={this.generateDateId(cursor)}
                      date={cursor}
                      disabled={disabled || !isCurrentMonth || !isDateInRange(cursor, min, max)}
                      isToday={cursor.isSame(moment(), 'day')}
                      isCurrentMonth={isCurrentMonth}
                      selected={isSelected}
                      isRangeSelected={isRangeSelected}
                      isRangeSelection={isRangeSelection}
                      isRangeSelectionInProgress={isRangeSelectionInProgress}
                      isSelectionStart={isSelectionStart}
                      isSelectionEnd={isSelectionEnd}
                      isRangeStart={isRangeStart}
                      isRangeEnd={isRangeEnd}
                      focused={isFocused && dateFocusedLocal && cursorLocal.isSame(dateFocusedLocal, 'day')}
                      onClick={this.handleDayClick}
                      onMouseDown={this.handleDayMouseDown}
                      onHighlight={this.onHighlight} />
                  );
                })
              }
            </tr>
          ))
        }
      </tbody>
    );
  }

  render() {
    const {
      name,
      headerFormat,
      valueFormat,
      className,
      disabled,
      invalid,
      readOnly,
      selectionType,
      ...otherProps
    } = this.props;

    const {focusedDate, highlightedRange, currentMonth} = this.state;
    const headingId = this.generateId('heading');
    const descriptionId = this.generateId('description');
    const activeDescendantId = this.generateDateId(focusedDate);
    const isRangeSelection = selectionType === 'range';
    let ariaLabelledby = headingId;

    delete otherProps.autoFocus;
    delete otherProps.required;

    // If Calendar is labelled by an external element, concatenate id to include the external label and the Calendar Month/Year heading
    if (otherProps['aria-labelledby']) {
      ariaLabelledby = otherProps['aria-labelledby'] + ' ' + ariaLabelledby;
      delete otherProps['aria-labelledby'];
    }

    // Make sure moment localizes date formatting per Intl.locale
    moment.locale(getLocale());
    currentMonth.locale(getLocale());
    const currentMonthFormatted = currentMonth.format(headerFormat);

    return (
      <div
        className={
          classNames(
            'spectrum-Calendar',
            className
          )
        }
        role="group"
        aria-labelledby={ariaLabelledby}
        {...filterDOMProps(otherProps)}>
        <input type="hidden" name={name} value={formatMoment(highlightedRange && highlightedRange.start, valueFormat)} />
        <div className="spectrum-Calendar-header">
          {/* Calendar Month/Year is the default aria-labelledby element and is a live region that should announce when the Month/Year changes */}
          <h2
            className="spectrum-Calendar-title"
            id={headingId}>
            {currentMonthFormatted}
          </h2>
          <Button
            ref={b => this.prevMonthButton = b}
            className="spectrum-Calendar-prevMonth"
            variant="action"
            quiet
            icon={<ChevronLeftLarge className="spectrum-Calendar-chevron" />}
            aria-label={formatMessage('previous')}
            title={formatMessage('previous')}
            disabled={disabled}
            onClick={this.handleClickPrevious} />
          <Button
            ref={b => this.nextMonthButton = b}
            className="spectrum-Calendar-nextMonth"
            variant="action"
            quiet
            icon={<ChevronRightLarge className="spectrum-Calendar-chevron" />}
            aria-label={formatMessage('next')}
            title={formatMessage('next')}
            disabled={disabled}
            onClick={this.handleClickNext} />
        </div>
        <div
          ref={el => this.calendarBody = el}
          className="spectrum-Calendar-body"
          role="grid"
          tabIndex={disabled ? null : '0'}
          aria-invalid={invalid}
          aria-readonly={readOnly}
          aria-disabled={disabled}
          aria-activedescendant={activeDescendantId}
          aria-labelledby={ariaLabelledby}
          aria-describedby={highlightedRange ? descriptionId : null}
          aria-multiselectable={isRangeSelection || null}
          onKeyDown={this.handleKeyDown}
          onFocus={this.onFocus}
          onBlur={this.onBlur}>
          {this.renderTable(currentMonth)}
        </div>
      </div>
    );
  }
}

const CalendarCell = function CalendarCell({
  id,
  date,
  isToday = false,
  isCurrentMonth = false,
  selected = false,
  disabled = false,
  focused = false,
  invalid = false,
  isRangeSelected = false,
  isRangeSelection = false,
  isRangeSelectionInProgress = false,
  isRangeStart = false,
  isRangeEnd = false,
  isSelectionStart = false,
  isSelectionEnd = false,
  onClick = function () {},
  onMouseDown = function () {},
  onHighlight = function () {}
}) {
  // title should be localize Day of week, Month, Day and Year without Time.
  let title = date.format('LLLL').replace(date.format('LT'), '').trim();
  let rangeSelectionPrompt = '';

  // Localized string for cell title/aria-label
  if (isToday) {
    // If date is today, set appropriate string depending on selected state:
    title = formatMessage(selected ? 'todayDateSelected' : 'todayDate', {
      date: date.toDate()
    });
  } else if (selected) {
    // If date is selected but not today:
    title = formatMessage('dateSelected', {
      date: date.toDate()
    });
  }

  // When cell is focused and selection mode is range,
  if (isRangeSelection && focused) {
    // If selection has started add "click to finish selecting range"
    if (isRangeSelectionInProgress) {
      rangeSelectionPrompt = formatMessage('finishRangeSelectionPrompt');
    // Otherwise, if no range is selected, add "click to start selecting range" prompt
    } else if (!isRangeSelected) {
      rangeSelectionPrompt = formatMessage('startRangeSelectionPrompt');
    }
    // If rangeSelectionPrompt has been set, add parentheses
    if (rangeSelectionPrompt.length) {
      rangeSelectionPrompt = ` (${rangeSelectionPrompt})`;
    }
  }

  return (
    <td
      id={id}
      role="gridcell"
      className="spectrum-Calendar-tableCell"
      aria-disabled={disabled}
      aria-selected={selected}
      aria-invalid={invalid}
      aria-label={title + rangeSelectionPrompt}
      title={disabled ? null : title}
      onClick={disabled ? null : e => onClick(e, date.clone())}
      onMouseDown={disabled ? null : e => onMouseDown(e, date.clone())}
      onMouseEnter={disabled ? null : e => onHighlight(e, date.clone())}
      tabIndex={disabled ? null : -1}>
      <span
        role="presentation"
        className={classNames('spectrum-Calendar-date', {
          'is-today': isToday,
          'is-selected': selected,
          'is-focused': focused,
          'is-disabled': disabled,
          'is-outsideMonth': !isCurrentMonth,
          'is-range-start': isRangeSelection && isRangeStart,
          'is-range-end': isRangeSelection && isRangeEnd,
          'is-range-selection': isRangeSelection && selected,
          'is-selection-start': isRangeSelection && isSelectionStart,
          'is-selection-end': isRangeSelection && isSelectionEnd
        })}>
        {date.date()}
      </span>
    </td>
  );
};

CalendarCell.displayName = 'CalendarCell';
