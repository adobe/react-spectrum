import autobind from 'autobind-decorator';
import Button from '../../Button';
import classNames from 'classnames';
import createId from '../../utils/createId';
import {DateRange} from 'moment-range';
import {formatMoment, isDateInRange, toMoment} from '../../utils/moment';
import moment from 'moment';
import React, {Component, PropTypes} from 'react';
import '../style/index.styl';

@autobind
export default class Calendar extends Component {
  static displayName = 'Calendar';

  static propTypes = {
    id: PropTypes.string,
    headerFormat: PropTypes.string,
    max: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.number
    ]),
    min: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.number
    ]),
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.number
    ]),
    valueFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    selectionType: PropTypes.string,
    startDay: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6]),
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    required: PropTypes.bool,
    invalid: PropTypes.bool,
    onChange: PropTypes.func
  };

  static defaultProps = {
    id: createId(),
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

  generateDateId(date) {
    const {id} = this.props;

    return `${id}-${date.format('l')}`;
  }

  handleClickPrevious() {
    const {currentMonth} = this.state;
    this.setState({
      currentMonth: currentMonth.clone().add(-1, 'month').startOf('month')
    });
  }

  handleClickNext() {
    const {currentMonth} = this.state;
    this.setState({
      currentMonth: currentMonth.clone().add(1, 'month').startOf('month')
    });
  }

  handleDayClick(e, date) {
    this.selectFocused(date);
  }

  getSelectingRange(date) {
    let min = moment.min(this.state.focusedDate, date).clone();
    let max = moment.max(this.state.focusedDate, date).clone();
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
          this.setState({selectingRange: null});
        }
        break;
      default: // default, do nothing
        break;
    }
  }

  focusTimeUnit(date) {
    const {currentMonth} = this.state;
    const sameMonthAsVisible = currentMonth.isSame(date, 'month');
    const newCurrentMonth = sameMonthAsVisible ? currentMonth : date.clone().startOf('month');

    this.setState({
      focusedDate: date,
      currentMonth: newCurrentMonth
    });

    this.focusCalendarBody();
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
    if (this.props.selectionType === 'range') {
      // If this is the second date selected, set the value.
      // Otherwise, setup the selecting range.
      if (this.state.selectingRange) {
        this.setValue(this.getSelectingRange(date));
      } else {
        selectingRange = this.getRange(date);
      }
    } else {
      this.setValue(date);
    }

    this.setState({
      focusedDate: date,
      selectingRange
    });

    this.focusCalendarBody();
  }

  focusCalendarBody() {
    if (this.calendarBody) {
      this.calendarBody.focus();
    }
  }

  renderTable(date) {
    return (
      <table
        key={date.format('MM/Y')}
        role="presentation"
        className="spectrum-Calendar-table">
        {this.renderTableHeader()}
        {this.renderTableBody(date)}
      </table>
    );
  }

  renderTableHeader() {
    const {startDay} = this.props;

    return (
      <thead role="presentation">
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
    const {highlightedRange, selectingRange, min, max, isFocused, focusedDate, currentMonth} = this.state;
    const range = selectingRange || highlightedRange;

    const month = date.month();
    const year = date.year();
    const dateFocusedLocal = focusedDate ? focusedDate.clone().startOf('day') : null;
    let monthStartsAt = (currentMonth.day() - startDay) % 7;

    if (monthStartsAt < 0) {
      monthStartsAt += 7;
    }

    return (
      <tbody role="presentation">
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
                  return (
                    <CalendarCell
                      key={dayIndex}
                      id={this.generateDateId(cursor)}
                      date={cursor}
                      disabled={disabled || !isCurrentMonth || !isDateInRange(cursor, min, max)}
                      isToday={cursor.isSame(moment(), 'day')}
                      isCurrentMonth={isCurrentMonth}
                      selected={range && range.contains(cursorLocal)}
                      isRangeSelection={this.props.selectionType === 'range'}
                      isSelectionStart={isSelectionStart}
                      isSelectionEnd={isSelectionEnd}
                      isRangeStart={isRangeStart}
                      isRangeEnd={isRangeEnd}
                      focused={isFocused && dateFocusedLocal && cursorLocal.isSame(dateFocusedLocal, 'day')}
                      onClick={this.handleDayClick}
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
      required,
      readOnly,
      ...otherProps
    } = this.props;

    const {focusedDate, highlightedRange, currentMonth} = this.state;

    delete otherProps.startDay;

    return (
      <div
        className={
          classNames(
            'spectrum-Calendar',
            className
          )
        }
        aria-required={required}
        aria-readonly={readOnly}
        aria-invalid={invalid}
        aria-disabled={disabled}
        {...otherProps}>
        <input type="hidden" name={name} value={formatMoment(highlightedRange && highlightedRange.start, valueFormat)} />
        <div className="spectrum-Calendar-header">
          <h2
            className="spectrum-Heading spectrum-Calendar-heading"
            role="heading"
            aria-live="assertive"
            aria-atomic="true">
            {currentMonth.format(headerFormat)}
          </h2>
          <Button
            className="spectrum-Calendar-prevMonth"
            variant="icon"
            aria-label="Previous"
            title="Previous"
            disabled={disabled}
            square
            onClick={this.handleClickPrevious} />
          <Button
            className="spectrum-Calendar-nextMonth"
            variant="icon"
            aria-label="Next"
            title="Next"
            disabled={disabled}
            square
            onClick={this.handleClickNext} />
        </div>
        <div
          ref={el => {this.calendarBody = el; }}
          className="spectrum-Calendar-body"
          role="grid"
          tabIndex={disabled ? null : '0'}
          aria-readonly="true"
          aria-disabled={disabled}
          aria-activedescendant={focusedDate && this.generateDateId(focusedDate)}
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
  isRangeSelection = false,
  isRangeStart = false,
  isRangeEnd = false,
  isSelectionStart = false,
  isSelectionEnd = false,
  onClick = function () {},
  onHighlight = function () {}
}) {
  let title = `${date.format('dddd')}, ${date.format('LL')}`;
  if (isToday) {
    title = `Today, ${title}`;
  }

  if (selected) {
    title = `${title} selected`;
  }

  return (
    <td
      id={id}
      role="gridcell"
      className="spectrum-Calendar-tableCell"
      aria-disabled={disabled}
      aria-selected={selected}
      aria-invalid={invalid}
      title={title}
      onClick={!disabled && (e => {onClick(e, date.clone()); })}
      onMouseEnter={(e => { !disabled && onHighlight(e, date.clone()); })}>
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
