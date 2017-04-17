import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import moment from 'moment';

import Button from '../../Button';
import createId from '../../utils/createId';
import { toMoment, isDateInRange, formatMoment } from '../../utils/moment';

import '../style/index.styl';

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
    startDay: 0,
    disabled: false,
    invalid: false,
    readOnly: false,
    required: false,
    onChange: () => {}
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
    const today = toMoment('today', valueFormat);

    this.setState({
      value: newValue,
      min: newMin && newMin.startOf('day'),
      max: newMax && newMax.startOf('day'),
      today,
      focusedDate: newValue ? newValue.clone() : today.clone()
    });

    this.setCurrentMonth(newValue, today);
  }

  componentWillReceiveProps(nextProps) {
    const { min, max, valueFormat } = this.props;
    const { today } = this.state;

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

    if ('value' in nextProps && +nextProps.value !== +this.state.value) {
      const newValue = toMoment(nextProps.value, nextProps.valueFormat);
      this.setState({
        value: newValue,
        focusedDate: newValue ? newValue.clone() : today.clone()
      });

      // Only change the current month window if the next value is a different day than
      // what we currently have.  We don't want to trigger the month switch if we are just
      // changing the hours or minutes of the day.
      if (
        nextProps.value &&
        nextProps.value.isSame &&
        !nextProps.value.isSame(this.state.value, 'day')
      ) {
        this.setCurrentMonth(nextProps.value);
      }
    }
  }

  setValue(date) {
    const { onChange, valueFormat } = this.props;

    if (!('value' in this.props)) {
      this.setState({ value: date, focusedDate: date });
      this.setCurrentMonth(date);
    }

    onChange(formatMoment(date, valueFormat), date.toDate());
  }

  setCurrentMonth(date, today = this.state.today) {
    const visibleMonth = date && date.isValid() ? date : today;

    this.setState({
      currentMonth: visibleMonth.clone().startOf('month')
    });
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
      default: // default, do nothing
        break;
    }
  }

  focusTimeUnit(date) {
    const { currentMonth } = this.state;
    const sameMonthAsVisible = currentMonth.isSame(date, 'month');
    const newCurrentMonth = sameMonthAsVisible ? currentMonth : date.clone().startOf('month');

    this.setState({
      focusedDate: date,
      currentMonth: newCurrentMonth
    });

    this.focusCalendarBody();
  }

  selectFocused(date) {
    const { value } = this.state;

    date = date.clone();
    if (value && moment.isMoment(value) && value.isValid()) {
      date.hour(value.hour());
      date.minute(value.minute());
      date.second(value.second());
      date.millisecond(value.millisecond());
    }

    this.setValue(date);
    this.setState({
      focusedDate: date
    });

    this.focusCalendarBody();
  }

  focusCalendarBody() {
    if (this.refs.calendarBody) {
      this.refs.calendarBody.focus();
    }
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
      required,
      readOnly,
      ...otherProps
    } = this.props;

    const { value, currentMonth } = this.state;

    delete otherProps.startDay;

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
        aria-required={ required }
        aria-readonly={ readOnly }
        aria-invalid={ invalid }
        aria-disabled={ disabled }
        { ...otherProps }
      >
        <input type="hidden" name={ name } value={ formatMoment(value, valueFormat) } />
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
            className="coral-Calendar-prevMonth"
            icon="chevronLeft"
            variant="minimal"
            iconSize="XS"
            aria-label="Previous"
            title="Previous"
            disabled={ disabled }
            square
            onClick={ this.handleClickPrevious }
          />
          <Button
            className="coral-Calendar-nextMonth"
            icon="chevronRight"
            variant="minimal"
            iconSize="XS"
            aria-label="Next"
            title="Next"
            disabled={ disabled }
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

CalendarCell.displayName = 'CalendarCell';
