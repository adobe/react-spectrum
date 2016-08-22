import React, { Component } from 'react';
import classNames from 'classnames';
import moment from 'moment';

import Button from './Button';
import createId from './utils/createId';
import { toMoment, isDateInRange } from './utils/moment';

import './Calendar.styl';

export default class Calendar extends Component {
  static defaultProps = {
    id: createId(),
    headerFormat: 'MMMM YYYY',
    max: null,
    min: null,
    valueFormat: 'YYYY-MM-DD',
    startDay: 0,
    disabled: false,
    invalid: false,
    readOnly: false,
    required: false,
    onChange: () => {}
  };

  constructor(props) {
    super(props);

    const {
      value,
      defaultValue,
      min,
      max,
      valueFormat
    } = props;

    const newValue = toMoment(value || defaultValue || 'today', valueFormat);

    this.state = {
      value: newValue,
      min: toMoment(min, valueFormat),
      max: toMoment(max, valueFormat),
      today: toMoment('today', valueFormat),
      focusedDate: newValue.clone(),
      currentMonth: newValue.clone().startOf('month')
    };
  }

  componentWillReceiveProps(nextProps) {
    const { min, max, valueFormat } = this.props;

    if (min !== nextProps.min || valueFormat !== nextProps.valueFormat) {
      this.setState({
        min: toMoment(nextProps.min, nextProps.valueFormat)
      });
    }

    if (max !== nextProps.max || valueFormat !== nextProps.valueFormat) {
      this.setState({
        max: toMoment(nextProps.max, nextProps.valueFormat)
      });
    }

    if ('value' in nextProps) {
      this.setState({
        value: toMoment(nextProps.value, nextProps.valueFormat)
      });
    }
  }

  setValue(date) {
    const { onChange, valueFormat } = this.props;

    if (!('value' in this.props)) {
      this.setState({
        value: date
      });
    }

    onChange(date.format(valueFormat), date.toDate());
  }

  generateDateId(date) {
    const { id } = this.props;

    return `${ id }-${ date.format('l') }`;
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
    const { value } = this.state;

    this.setValue(date.clone().hour(value.hour()).minute(value.minute()));
    this.setState({
      focusedDate: date
    });

    this.refs.calendarBody.focus();
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
                <th
                  key={ index }
                  role="columnheader"
                  scope="col"
                >
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
    const { value, min, max, focusedDate, currentMonth } = this.state;

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
              <tr key={ weekIndex } role="row">
                {
                  [...new Array(7).keys()].map(dayIndex => {
                    const day = (weekIndex * 7 + dayIndex) - monthStartsAt + 1;
                    const cursor = moment(new Date(year, month, day));
                    const isCurrentMonth = (cursor.month()) === parseFloat(month);
                    const cursorLocal = cursor.clone().startOf('day');
                    return (
                      <CalendarCell
                        key={ dayIndex }
                        id={ this.generateDateId(cursor) }
                        date={ cursor }
                        disabled={ disabled || !isCurrentMonth || !isDateInRange(cursor, min, max) }
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
      headerFormat,
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
        <input type="hidden" name={ name } value={ value && value.format(valueFormat) } />
        <div className="coral-Calendar-calendarHeader">
          <div
            className="coral-Heading coral-Heading--2"
            role="heading"
            aria-live="assertive"
            aria-atomic="true"
          >
            { currentMonth.format(headerFormat) }
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
          aria-activedescendant={ value && this.generateDateId(value) }
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
  isToday = false,
  selected = false,
  disabled = false,
  focused = false,
  invalid = false,
  onClick = () => {}
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
      onClick={ !disabled && (e => { onClick(e, date.clone()); }) }
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
