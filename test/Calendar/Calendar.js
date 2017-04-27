import Calendar from '../../src/Calendar';
import {DateRange} from 'moment-range';
import expect, {createSpy} from 'expect';
import moment from 'moment';
import React from 'react';
import {shallow} from 'enzyme';

describe('Calendar', () => {
  const DEFAULT_VALUE_FORMAT = 'YYYY-MM-DD';
  const DEFAULT_HEADER_FORMAT = 'MMMM YYYY';

  it('default', () => {
    const now = moment();

    const tree = shallow(<Calendar />);
    expect(tree.hasClass('coral-Calendar')).toBe(true);

    const headerTitle = findHeaderTitle(tree);
    expect(headerTitle.text()).toBe(now.format(DEFAULT_HEADER_FORMAT));

    const prevBtn = findPreviousButton(tree);
    expect(prevBtn.prop('aria-label')).toBe('Previous');
    expect(prevBtn.prop('title')).toBe('Previous');
    const nextBtn = findNextButton(tree);
    expect(nextBtn.prop('aria-label')).toBe('Next');
    expect(nextBtn.prop('title')).toBe('Next');

    const body = findBody(tree);
    expect(body.find('thead tr').length).toBe(1);
    const headerCells = body.find('thead tr th');
    expect(headerCells.length).toBe(7);
    expect(headerCells.first().childAt(0).prop('title')).toBe('Sunday'); // week starts Sunday
    expect(body.find('tbody tr').length).toBe(6);
    expect(body.find('tbody tr CalendarCell').length).toBe(42); // 6 weeks * 7 days each
  });

  it('supports defaultValue uncontrolled behavior', () => {
    const date = moment(new Date(2016, 7, 1));
    const weekLater = date.clone().add(1, 'week');
    const tree = shallow(<Calendar defaultValue={ date } />);

    // Setting defaultValue later doesn't change the state. Only component interactions
    // change the state.
    tree.setProps({defaultValue: weekLater});
    expect(+tree.state('value')).toEqual(+date);

    // Component interaction should change the state.
    findCellByDate(tree, weekLater).simulate('click', {}, weekLater);
    expect(+tree.state('value')).toEqual(+weekLater);
  });

  it('supports value controlled behavior', () => {
    const date = moment(new Date(2016, 7, 1));
    const weekLater = date.clone().add(1, 'week');
    const tree = shallow(<Calendar value={ date } />);

    // Changing value will change the state
    tree.setProps({value: weekLater});
    expect(+tree.state('value')).toEqual(+weekLater);

    // Component interaction should not change the state, only manually setting value
    // as a prop will change the state.
    findCellByDate(tree, date).simulate('click', {}, date);
    expect(+tree.state('value')).toEqual(+weekLater);
  });

  it('supports startDay', () => {
    const tree = shallow(<Calendar startDay={ 2 } />); // Weeks start on Tuesday
    // Grab first column to see if it is Tuesday
    const head = tree.find('.coral-Calendar-calendarBody thead tr th').first();
    expect(head.childAt(0).prop('title')).toBe('Tuesday');
    expect(head.childAt(0).text()).toBe('Tu');
  });

  it('supports headerFormat', () => {
    const tree = shallow(<Calendar value="2016-08-01" headerFormat="M/YYYY" />);
    expect(findHeaderTitle(tree).text()).toBe('8/2016');
  });

  it('supports valueFormat', () => {
    const tree = shallow(<Calendar value="08-01-2016" valueFormat="MM-DD-YYYY" />);
    expect(+tree.state('value')).toBe(+new Date(2016, 7, 1));
    tree.setProps({value: '01-08-2016'});
    expect(+tree.state('value')).toBe(+new Date(2016, 0, 8));
  });

  it('supports selectionType=range', function () {
    const start = moment(new Date(2016, 7, 1));
    const end = moment(new Date(2016, 7, 5));
    const tree = shallow(<Calendar selectionType="range" value={[start, end]} />);
    expect(tree.state('value')).toEqual(new DateRange(start, end));
  });

  it('supports selectionType=range with uncontrolled behavior', function () {
    const start = moment(new Date(2016, 7, 1));
    const end = moment(new Date(2016, 7, 5));
    const tree = shallow(<Calendar selectionType="range" defaultValue={[start, end]} />);
    expect(tree.state('value')).toEqual(new DateRange(start, end));

    const weekLater = new DateRange(start.clone().add(1, 'week'), end.clone().add(1, 'week'));

    // Setting defaultValue later doesn't change the state.
    tree.setProps({defaultValue: weekLater});
    expect(tree.state('value').toDate()).toEqual([start.toDate(), end.toDate()]);

    // Component interaction should change the state.
    findCellByDate(tree, weekLater.start).simulate('click', {}, weekLater.start);
    findCellByDate(tree, weekLater.end).simulate('click', {}, weekLater.end);
    expect(tree.state('value').toDate()).toEqual(weekLater.toDate());
  });

  it('supports selectionType=range with controlled behavior', function () {
    const start = moment(new Date(2016, 7, 1));
    const end = moment(new Date(2016, 7, 5));
    const tree = shallow(<Calendar selectionType="range" value={[start, end]} />);
    expect(tree.state('value')).toEqual(new DateRange(start, end));

    const weekLater = new DateRange(start.clone().add(1, 'week'), end.clone().add(1, 'week'));

    // Changing value will change the state
    tree.setProps({value: weekLater});
    expect(tree.state('value').toDate()).toEqual(weekLater.toDate());

    // Component interaction should not change the state, only manually setting value
    // as a prop will change the state.
    findCellByDate(tree, start).simulate('click', {}, start);
    findCellByDate(tree, end).simulate('click', {}, end);
    expect(tree.state('value').toDate()).toEqual(weekLater.toDate());
  });

  describe('dispatches onChange', () => {
    let spy;

    const assertOnChangeArgsMatch = el => {
      const newDate = el.prop('date').clone();

      const args = spy.getLastCall().arguments;
      expect(+args[0]).toBe(+newDate);
    };

    beforeEach(() => {
      spy = createSpy();
    });

    it('when a non-disabled day is clicked', () => {
      const tree = shallow(<Calendar onChange={ spy } />);
      const firstNonSelectedCell = findFirstNonSelectedCell(tree);
      const firstNonSelectedCellDate = firstNonSelectedCell.prop('date');
      firstNonSelectedCell.simulate('click', {}, firstNonSelectedCellDate);
      assertOnChangeArgsMatch(firstNonSelectedCell);
    });

    it('when a focused day receives enter/space keydown event', () => {
      const tree = shallow(<Calendar onChange={ spy } />);
      const preventDefaultSpy = createSpy();
      const firstNonSelectedCell = findFirstNonSelectedCell(tree);
      const firstNonSelectedCellDate = firstNonSelectedCell.prop('date');
      tree.setState({focusedDate: firstNonSelectedCellDate});
      findBody(tree).simulate('keydown', {keyCode: 13, preventDefault: preventDefaultSpy});
      assertOnChangeArgsMatch(firstNonSelectedCell);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('with a range when selectionType=range', function () {
      const tree = shallow(<Calendar onChange={ spy } selectionType="range" />);
      const startCell = findFirstNonSelectedCell(tree);
      const endCell = findAllSelectableCells(tree).at(5);
      const startDate = startCell.prop('date');
      const endDate = endCell.prop('date');
      startCell.simulate('click', {}, startDate);
      endCell.simulate('click', {}, endDate);
      expect(spy.getLastCall().arguments[0].toDate()).toEqual([startDate.toDate(), endDate.toDate()]);
    });
  });

  describe('currentMonth', () => {
    let now;
    let tree;

    beforeEach(() => {
      now = moment().startOf('day');
      tree = shallow(<Calendar value={ now } />);
    });

    it('changes currentMonth when value prop is set to different day', () => {
      const date3MonthsLater = now.clone().add(3, 'month');
      expect(+tree.state('currentMonth')).toBe(+now.clone().startOf('month'));
      tree.setProps({value: date3MonthsLater});
      expect(+tree.state('currentMonth')).toBe(+date3MonthsLater.clone().startOf('month'));
    });

    it('changes currentMonth when previous or next buttons are clicked', () => {
      const previousMonth = now.clone().subtract(1, 'month');
      findPreviousButton(tree).simulate('click');
      expect(+tree.state('focusedDate')).toBe(+previousMonth.clone());
      expect(+tree.state('currentMonth')).toBe(+previousMonth.clone().startOf('month'));
      findNextButton(tree).simulate('click');
      expect(+tree.state('focusedDate')).toBe(+now.clone());
      expect(+tree.state('currentMonth')).toBe(+now.clone().startOf('month'));
    });
  });

  describe('focusedDate', () => {
    let now;
    let preventDefaultSpy;
    let tree;
    let body;

    const assertDateAfterKeyDown = ({keyCode, date, meta = false}) => {
      preventDefaultSpy.restore();
      body.simulate('keydown', {preventDefault: preventDefaultSpy, keyCode, metaKey: meta});
      expect(+tree.state('focusedDate')).toBe(+date.clone());
      expect(+tree.state('currentMonth')).toBe(+date.clone().startOf('month'));
      expect(+findFocusedCell(tree).prop('date')).toBe(+date.clone().startOf('day'));
      expect(preventDefaultSpy).toHaveBeenCalled();
    };

    beforeEach(() => {
      now = moment().startOf('day');
      preventDefaultSpy = createSpy();
      tree = shallow(<Calendar value={ now } />);
      body = findBody(tree);
    });

    it('increments/decrements one day with left/right arrows', () => {
      const previousDay = now.clone().subtract(1, 'day');
      assertDateAfterKeyDown({keyCode: 37, date: previousDay}); // left arrow
      assertDateAfterKeyDown({keyCode: 39, date: now}); // right arrow
    });

    it('increments/decrements one week with up/down arrows', () => {
      const previousWeek = now.clone().subtract(1, 'week');
      assertDateAfterKeyDown({keyCode: 38, date: previousWeek}); // up arrow
      assertDateAfterKeyDown({keyCode: 40, date: now}); // down arrow
    });

    it('goes to beginning/end of month with home and end keys', () => {
      const monthBegin = now.clone().startOf('month').startOf('day');
      const monthEnd = now.clone().endOf('month').startOf('day');
      assertDateAfterKeyDown({keyCode: 36, date: monthBegin}); // home
      assertDateAfterKeyDown({keyCode: 35, date: monthEnd}); // end
    });

    it('increments/decrements one month with page up/down', () => {
      const previousMonth = now.clone().subtract(1, 'month');
      assertDateAfterKeyDown({keyCode: 33, date: previousMonth});
      assertDateAfterKeyDown({keyCode: 34, date: now});
    });

    it('increments/decrements one year with cmd + page up/down', () => {
      const previousYear = now.clone().subtract(1, 'year');
      assertDateAfterKeyDown({keyCode: 33, date: previousYear, meta: true});
      assertDateAfterKeyDown({keyCode: 34, date: now, meta: true});
    });

    it('is set to value if it exists', () => {
      const date = '2015-01-01';
      tree = shallow(<Calendar value={ date } />);
      expect(+tree.state('focusedDate')).toBe(+moment(date, DEFAULT_VALUE_FORMAT));
    });

    it('is set to defaultValue if it exists', () => {
      const date = '2015-01-01';
      tree = shallow(<Calendar defaultValue={ date } />);
      expect(+tree.state('focusedDate')).toBe(+moment(date, DEFAULT_VALUE_FORMAT));
    });

    it('is set to now if no value or defaultValue exist', () => {
      tree = shallow(<Calendar />);
      expect(tree.state('focusedDate').isSame(now, 'day')).toBe(true);
    });
  });

  describe('selectionType=range', function () {
    it('highlights the selected range when hovering over cells', function () {
      const before = moment().startOf('month').startOf('day');
      const start = before.clone().add(5, 'days');
      const after = start.clone().add(5, 'days');
      const tree = shallow(<Calendar selectionType="range" />);

      findCellByDate(tree, start).simulate('click', {}, start);
      expect(tree.state('selectingRange').toDate()).toEqual([start.toDate(), start.clone().endOf('day').toDate()]);

      findCellByDate(tree, before).simulate('highlight', {}, before);
      expect(tree.state('selectingRange').toDate()).toEqual([before.toDate(), start.toDate()]);

      findCellByDate(tree, after).simulate('highlight', {}, after);
      expect(tree.state('selectingRange').toDate()).toEqual([start.toDate(), after.toDate()]);
    });

    it('resets the selection when the escape key is pressed', function () {
      const before = moment().startOf('month').startOf('day');
      const start = before.clone().add(5, 'days');
      const after = start.clone().add(5, 'days');
      const tree = shallow(<Calendar selectionType="range" />);
      const body = findBody(tree);

      findCellByDate(tree, start).simulate('click', {}, start);
      findCellByDate(tree, before).simulate('highlight', {}, before);
      expect(tree.state('selectingRange').toDate()).toEqual([before.toDate(), start.toDate()]);

      body.simulate('keydown', {keyCode: 27});

      expect(tree.state('selectingRange')).toBe(null);
    });
  });

  it('sets min and max to the start of the respective day', () => {
    const minDate = moment(new Date(2016, 9, 24, 12, 30));
    const maxDate = minDate.clone().add(3, 'day');
    const tree = shallow(<Calendar min={ minDate } max={ maxDate } />);
    expect(+tree.state('min')).toBe(+minDate.startOf('day'));
    expect(+tree.state('max')).toBe(+maxDate.startOf('day'));

    const minDateMinus1 = minDate.clone().subtract(1, 'day');
    const maxDatePlus1 = maxDate.clone().add(1, 'day');
    tree.setProps({min: minDateMinus1, max: maxDatePlus1});
    expect(+tree.state('min')).toBe(+minDateMinus1.startOf('day'));
    expect(+tree.state('max')).toBe(+maxDatePlus1.startOf('day'));
  });

  it('enforces min and max', () => {
    const date = moment('2015-01-01', DEFAULT_VALUE_FORMAT);
    const oneWeekLater = date.clone().add(1, 'week');
    const tree = shallow(<Calendar value={ date } min={ date } max={ oneWeekLater } />);
    expect(findAllSelectableCells(tree).length).toBe(8); // includes start and end days
  });

  it('generateDateId', () => {
    const today = moment(new Date(2016, 7, 24));
    const tree = shallow(<Calendar value={ today } />);
    expect(tree.instance().generateDateId(today)).toBe('react-coral-1-8/24/2016');
  });

  describe('CalendarCell', () => {
    let now;
    let tree;
    const dateStringForTitle = date => `${ date.format('dddd') }, ${ date.format('LL') }`;

    beforeEach(() => {
      now = moment();
      tree = shallow(<Calendar value={ now } />);
    });

    describe('selected cell', () => {
      let cellTree;

      beforeEach(() => {
        cellTree = shallow(findFocusedCell(tree).node);
      });

      it('props', () => {
        expect(cellTree.prop('id')).toBe(tree.instance().generateDateId(now));
        expect(cellTree.prop('title')).toBe(`Today, ${ dateStringForTitle(now) } selected`);
        expect(cellTree.prop('aria-disabled')).toBe(false);
        expect(cellTree.prop('aria-selected')).toBe(true);
        expect(cellTree.prop('aria-invalid')).toBe(false);
        expect(cellTree.prop('onClick')).toExist();
        expect(cellTree.childAt(0).text()).toBe(`${ now.date() }`);
      });

      it('classes', () => {
        expect(cellTree.hasClass('is-today')).toBe(true);
        expect(cellTree.hasClass('is-selected')).toBe(true);
        expect(cellTree.hasClass('coral-focus')).toBe(true);
        expect(cellTree.childAt(0).hasClass('coral-Calendar-date')).toBe(true);
      });

      it('supports range selections', function () {
        const start = moment(new Date(2016, 7, 1));
        const end = moment(new Date(2016, 7, 5));
        const tree = shallow(<Calendar selectionType="range" value={[start, end]} />);

        const startCell = shallow(findCellByDate(tree, start).node).find('span');
        const midCell = shallow(findCellByDate(tree, start.clone().add(1, 'day')).node).find('span');
        const endCell = shallow(findCellByDate(tree, end).node).find('span');

        expect(startCell.hasClass('is-range-selection')).toBe(true);
        expect(startCell.hasClass('is-range-start')).toBe(true);
        expect(startCell.hasClass('is-range-end')).toBe(false);

        expect(midCell.hasClass('is-range-selection')).toBe(true);
        expect(midCell.hasClass('is-range-start')).toBe(false);
        expect(midCell.hasClass('is-range-end')).toBe(false);

        expect(endCell.hasClass('is-range-selection')).toBe(true);
        expect(endCell.hasClass('is-range-start')).toBe(false);
        expect(endCell.hasClass('is-range-end')).toBe(true);
      });
    });

    describe('disabled cell', () => {
      let cellTree;
      let startOfNextMonth;

      beforeEach(() => {
        startOfNextMonth = moment()
          .endOf('month')
          .add(1, 'day')
          .startOf('day');
        cellTree = shallow(findCellByDate(tree, startOfNextMonth).node);
      });

      it('props', () => {
        expect(cellTree.prop('id')).toBe(tree.instance().generateDateId(startOfNextMonth));
        expect(cellTree.prop('title')).toBe(dateStringForTitle(startOfNextMonth));
        expect(cellTree.prop('aria-disabled')).toBe(true);
        expect(cellTree.prop('aria-selected')).toBe(false);
        expect(cellTree.prop('aria-invalid')).toBe(false);
        expect(cellTree.prop('onClick')).toNotExist();
        expect(cellTree.childAt(0).text()).toBe(`${ startOfNextMonth.date() }`);
      });

      it('classes', () => {
        expect(cellTree.hasClass('is-today')).toBe(false);
        expect(cellTree.hasClass('is-selected')).toBe(false);
        expect(cellTree.hasClass('coral-focus')).toBe(false);
        expect(cellTree.childAt(0).hasClass('coral-Calendar-secondaryDate')).toBe(true);
      });
    });
  });

  it('supports disabled', () => {
    const tree = shallow(<Calendar disabled />);
    expect(tree.prop('aria-disabled')).toBe(true);
    expect(tree.hasClass('is-disabled')).toBe(true);

    const body = findBody(tree);
    // every cell should be disabled
    expect(body.find('tbody tr CalendarCell[disabled]').length).toBe(42);
    expect(body.prop('aria-disabled')).toBe(true);
  });

  it('supports invalid', () => {
    const tree = shallow(<Calendar invalid />);
    expect(tree.prop('aria-invalid')).toBe(true);
    expect(tree.hasClass('is-invalid')).toBe(true);
  });

  it('supports readOnly', () => {
    const tree = shallow(<Calendar readOnly />);
    expect(tree.prop('aria-readonly')).toBe(true);
  });

  it('supports required', () => {
    const tree = shallow(<Calendar required />);
    expect(tree.prop('aria-required')).toBe(true);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Calendar className="myClass" />);
    expect(tree.hasClass('myClass')).toBe(true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Calendar foo />);
    expect(tree.prop('foo')).toBe(true);
  });
});

const findHeaderTitle = tree => tree.find('.coral-Calendar-calendarHeader').childAt(0);
const findPreviousButton = tree => tree.find('.coral-Calendar-calendarHeader').childAt(1);
const findNextButton = tree => tree.find('.coral-Calendar-calendarHeader').childAt(2);
const findBody = tree => tree.find('.coral-Calendar-calendarBody');
const findAllCells = tree => findBody(tree).find('tbody tr CalendarCell');
const findAllSelectableCells = tree => (
  findAllCells(tree)
  .filterWhere(c => !c.prop('disabled'))
);
const findFirstNonSelectedCell = tree => findAllSelectableCells(tree).first();
const findFocusedCell = tree => findBody(tree).find('tbody tr CalendarCell[focused=true]');
const findCellByDate = (tree, date) =>
  findAllCells(tree).filterWhere(c => +c.prop('date') === +date);
