import React, { Component } from 'react';
import classNames from 'classnames';
import moment from 'moment';

import Button from './Button';
import createId from './utils/createId';

import './Calendar.styl';

export default class Calendar extends Component {
  static defaultProps = {
    headerFormat: 'MMMM YYYY',
    max: null,
    min: null,
    value: 'today',
    valueFormat: 'YYYY-MM-DD',
    startDay: 0,
    disabled: false,
    invalid: false,
    readOnly: false,
    required: false,
    onChange: () => {}
  };

  state = {
    value: null
  };

  componentWillMount() {
    const { value, min, max, valueFormat } = this.props;

    this.coralId = createId();

    const newValue = this.toMoment(value, valueFormat);

    this.setState({
      value: newValue,
      min: this.toMoment(min, valueFormat),
      max: this.toMoment(max, valueFormat),
      today: this.toMoment('today', valueFormat),
      focusedDate: newValue.clone(),
      currentMonth: newValue.clone().startOf('month')
    });
  }

  componentWillReceiveProps(nextProps) {
    const { value, min, max, valueFormat } = this.props;

    if (min !== nextProps.min || valueFormat !== nextProps.valueFormat) {
      this.setState({
        min: this.toMoment(nextProps.min, nextProps.valueFormat)
      });
    }

    if (max !== nextProps.max || valueFormat !== nextProps.valueFormat) {
      this.setState({
        max: this.toMoment(nextProps.max, nextProps.valueFormat)
      });
    }

    if (value !== nextProps.value || valueFormat !== nextProps.valueFormat) {
      this.setState({
        value: this.toMoment(nextProps.value, nextProps.valueFormat)
      });
    }
  }

  // TODO: Move to util?
  toMoment(value, format) {
    // if 'today'
    if (value === 'today') {
      return moment().startOf('day');
    }

    // If it's a moment object
    if (moment.isMoment(value)) {
      return value.isValid() ? value.clone() : null;
    }

    // Anything else
    const result = moment(value, value instanceof Date ? null : format);
    return result.isValid() ? result : null;
  }

  // TODO: Add to date util
  isDateInRange(date) {
    const { min, max } = this.state;

    if (!min && !max) {
      return true;
    }
    if (!min) {
      return date <= max;
    }
    if (!max) {
      return date >= min;
    }
    return min <= date && date <= max;
  }

  generateDateId(date) {
    return `${ this.coralId }-${ date.format('l') }`;
  }

  handleClickPrevious = () => {
    const { focusedDate } = this.state;
    this.focusTimeUnit(focusedDate.clone().subtract(1, 'month'));
  }

  handleClickNext = () => {
    const { focusedDate } = this.state;
    this.focusTimeUnit(focusedDate.clone().add(1, 'month'));
  }

  handleDayClick = (e, date) => {
    this.selectFocused(date);
  }

  handleKeyDown = e => {
    const { focusedDate } = this.state;
    const nextMoment = focusedDate.clone();

    e.preventDefault();

    switch (e.keyCode) {
      case 13: // enter
      case 32: // space
        this.selectFocused(nextMoment);
        break;
      case 33: // page up
        this.focusTimeUnit(nextMoment.subtract(1, e.metaKey ? 'year' : 'month'));
        break;
      case 34: // page down
        this.focusTimeUnit(nextMoment.add(1, e.metaKey ? 'year' : 'month'));
        break;
      case 35: // end
        this.focusTimeUnit(nextMoment.endOf('month').startOf('day'));
        break;
      case 36: // home
        this.focusTimeUnit(nextMoment.startOf('month').startOf('day'));
        break;
      case 37: // left arrow
        this.focusTimeUnit(nextMoment.subtract(1, 'day'));
        break;
      case 38: // up arrow
        this.focusTimeUnit(nextMoment.subtract(1, 'week'));
        break;
      case 39: // right arrow
        this.focusTimeUnit(nextMoment.add(1, 'day'));
        break;
      case 40: // down arrow
        this.focusTimeUnit(nextMoment.add(1, 'week'));
        break;
      default:
        break;
    }

    this.refs.calendarBody.focus();
  }

  focusTimeUnit(date) {
    const { currentMonth } = this.state;
    const sameMonthAsVisible = currentMonth.isSame(date, 'month');
    const newCurrentMonth = sameMonthAsVisible ? currentMonth : date.clone().startOf('month');

    this.setState({
      focusedDate: date,
      currentMonth: newCurrentMonth,
      animationDirection: +newCurrentMonth > +currentMonth ? 'right' : 'left'
    });
  }

  selectFocused(date) {
    const { onChange, valueFormat } = this.props;

    this.setState({
      value: date,
      focusedDate: date
    });
    this.refs.calendarBody.focus();

    onChange(date.format(valueFormat), date.toDate());
  }

  renderTable(date) {
    return (
      <div key={ date.format('MM/Y') }>
        <table
          role="presentation"
        >
          { this.renderTableHeader() }
          { this.renderTableBody(date) }
        </table>
      </div>
    );
  }

  renderTableHeader() {
    const { startDay } = this.props;

    return (
      <thead role="presentation">
        <tr role="row">
          {
            [...new Array(7).keys()].map(index => {
              const dayMoment = moment().day((index + startDay) % 7);
              return (
                <th role="columnheader" scope="col">
                  <abbr
                    className="coral-Calendar-dayOfWeek"
                    title={ dayMoment.format('dddd') }
                  >
                    { dayMoment.format('dd') }
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
    const { startDay, disabled } = this.props;
    const { value, focusedDate, currentMonth } = this.state;

    const month = date.month();
    const year = date.year();
    const dateLocal = value ? value.clone().startOf('day') : null;
    const dateFocusedLocal = focusedDate ? focusedDate.clone().startOf('day') : null;
    let monthStartsAt = (currentMonth.day() - startDay) % 7;

    if (monthStartsAt < 0) {
      monthStartsAt += 7;
    }

    return (
      <tbody role="presentation">
        {
          [...new Array(6).keys()].map(weekIndex => {
            return (
              <tr role="row">
                {
                  [...new Array(7).keys()].map(dayIndex => {
                    const day = (weekIndex * 7 + dayIndex) - monthStartsAt + 1;
                    const cursor = moment(new Date(year, month, day));
                    const isCurrentMonth = (cursor.month()) === parseFloat(month);
                    const cursorLocal = cursor.clone().startOf('day');
                    return (
                      <CalendarCell
                        id={ this.generateDateId(cursor) }
                        date={ cursor }
                        disabled={ disabled || !isCurrentMonth || !this.isDateInRange(cursor) }
                        isToday={ cursor.isSame(moment(), 'day') }
                        selected={ dateLocal && cursorLocal.isSame(dateLocal, 'day') }
                        focused={ dateFocusedLocal && cursorLocal.isSame(dateFocusedLocal, 'day') }
                        onClick={ this.handleDayClick }
                      />
                    );
                  })
                }
              </tr>
            );
          })
        }
      </tbody>
    );
  }

  render() {
    const {
      name,
      valueFormat,
      className,
      disabled,
      focused,
      invalid,
      ...otherProps
    } = this.props;

    const { value, currentMonth } = this.state;

    return (
      <div
        className={
          classNames(
            'coral-Calendar',
            {
              'is-disabled': disabled,
              'is-invalid': invalid,
              'coral-focus': focused
            },
            className
          )
        }
        { ...otherProps }
      >
        <input type="hidden" name={ name } value={ value.format(valueFormat) } />
        <div className="coral-Calendar-calendarHeader">
          <div
            className="coral-Heading coral-Heading--2"
            role="heading"
            aria-live="assertive"
            aria-atomic="true"
          >
            { currentMonth.format('MMMM YYYY') }
          </div>
          <Button
            disabled={ disabled }
            className="coral-Calendar-prevMonth"
            icon="chevronLeft"
            variant="minimal"
            iconSize="XS"
            aria-label="Previous"
            title="Previous"
            square
            onClick={ this.handleClickPrevious }
          />
          <Button
            disabled={ disabled }
            className="coral-Calendar-nextMonth"
            icon="chevronRight"
            variant="minimal"
            iconSize="XS"
            aria-label="Next"
            title="Next"
            square
            onClick={ this.handleClickNext }
          />
        </div>
        <div
          ref="calendarBody"
          className="coral-Calendar-calendarBody"
          role="grid"
          tabIndex={ disabled ? null : '0' }
          aria-readonly="true"
          aria-disabled={ disabled }
          aria-activedescendant={ this.generateDateId(value) }
          onKeyDown={ this.handleKeyDown }
        >
          { this.renderTable(currentMonth) }
        </div>
      </div>
    );
  }
}

const CalendarCell = function CalendarCell({
  id,
  date,
  onClick,
  isToday = false,
  selected = false,
  disabled = false,
  focused = false,
  invalid = false
}) {
  let title = `${ date.format('dddd') }, ${ date.format('LL') }`;
  if (isToday) {
    title = `Today, ${ title }`;
  }
  if (selected) {
    title = `${ title } selected`;
  }

  return (
    <td
      id={ id }
      className={
        classNames(
          {
            'is-today': isToday,
            'is-selected': selected,
            'coral-focus': focused
          }
        )
      }
      role="gridcell"
      aria-disabled={ disabled }
      aria-selected={ selected }
      aria-invalid={ invalid }
      title={ title }
      onClick={ !disabled && (e => { onClick(e, date); }) }
    >
      <span
        role="presentation"
        className={ disabled ? 'coral-Calendar-secondaryDate' : 'coral-Calendar-date' }
      >
        { date.date() }
      </span>
    </td>
  );
};
