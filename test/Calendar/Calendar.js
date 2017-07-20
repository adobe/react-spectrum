import assert from 'assert';
import Calendar from '../../src/Calendar';
import {DateRange} from 'moment-range';
import moment from 'moment';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';

describe('Calendar', () => {
  const DEFAULT_VALUE_FORMAT = 'YYYY-MM-DD';
  const DEFAULT_HEADER_FORMAT = 'MMMM YYYY';

  it('default', () => {
    const now = moment();

    const tree = shallow(<Calendar />);
    assert.equal(tree.hasClass('coral-Calendar'), true);

    const headerTitle = findHeaderTitle(tree);
    assert.equal(headerTitle.text(), now.format(DEFAULT_HEADER_FORMAT));

    const prevBtn = findPreviousButton(tree);
    assert.equal(prevBtn.prop('aria-label'), 'Previous');
    assert.equal(prevBtn.prop('title'), 'Previous');
    const nextBtn = findNextButton(tree);
    assert.equal(nextBtn.prop('aria-label'), 'Next');
    assert.equal(nextBtn.prop('title'), 'Next');

    const body = findBody(tree);
    assert.equal(body.find('thead tr').length, 1);
    const headerCells = body.find('thead tr th');
    assert.equal(headerCells.length, 7);
    assert.equal(headerCells.first().childAt(0).prop('title'), 'Sunday'); // week starts Sunday
    assert.equal(body.find('tbody tr').length, 6);
    assert.equal(body.find('tbody tr CalendarCell').length, 42); // 6 weeks * 7 days each
  });

  it('supports defaultValue uncontrolled behavior', () => {
    const date = moment(new Date(2016, 7, 1));
    const weekLater = date.clone().add(1, 'week');
    const tree = shallow(<Calendar defaultValue={date} />);

    // Setting defaultValue later doesn't change the state. Only component interactions
    // change the state.
    tree.setProps({defaultValue: weekLater});
    assert.deepEqual(+tree.state('value'), +date);

    // Component interaction should change the state.
    findCellByDate(tree, weekLater).simulate('click', {}, weekLater);
    assert.deepEqual(+tree.state('value'), +weekLater);
  });

  it('supports value controlled behavior', () => {
    const date = moment(new Date(2016, 7, 1));
    const weekLater = date.clone().add(1, 'week');
    const tree = shallow(<Calendar value={date} />);

    // Changing value will change the state
    tree.setProps({value: weekLater});
    assert.deepEqual(+tree.state('value'), +weekLater);

    // Component interaction should not change the state, only manually setting value
    // as a prop will change the state.
    findCellByDate(tree, date).simulate('click', {}, date);
    assert.deepEqual(+tree.state('value'), +weekLater);
  });

  it('supports startDay', () => {
    const tree = shallow(<Calendar startDay={2} />); // Weeks start on Tuesday
    // Grab first column to see if it is Tuesday
    const head = tree.find('.coral-Calendar-calendarBody thead tr th').first();
    assert.equal(head.childAt(0).prop('title'), 'Tuesday');
    assert.equal(head.childAt(0).text(), 'Tu');
  });

  it('supports headerFormat', () => {
    const tree = shallow(<Calendar value="2016-08-01" headerFormat="M/YYYY" />);
    assert.equal(findHeaderTitle(tree).text(), '8/2016');
  });

  it('supports valueFormat', () => {
    const tree = shallow(<Calendar value="08-01-2016" valueFormat="MM-DD-YYYY" />);
    assert.equal(+tree.state('value'), +new Date(2016, 7, 1));
    tree.setProps({value: '01-08-2016'});
    assert.equal(+tree.state('value'), +new Date(2016, 0, 8));
  });

  it('supports selectionType=range', function () {
    const start = moment(new Date(2016, 7, 1));
    const end = moment(new Date(2016, 7, 5));
    const tree = shallow(<Calendar selectionType="range" value={[start, end]} />);
    assert.deepEqual(tree.state('value'), new DateRange(start, end));
  });

  it('supports selectionType=range with uncontrolled behavior', function () {
    const start = moment(new Date(2016, 7, 1));
    const end = moment(new Date(2016, 7, 5));
    const tree = shallow(<Calendar selectionType="range" defaultValue={[start, end]} />);
    assert.deepEqual(tree.state('value'), new DateRange(start, end));

    const weekLater = new DateRange(start.clone().add(1, 'week'), end.clone().add(1, 'week'));

    // Setting defaultValue later doesn't change the state.
    tree.setProps({defaultValue: weekLater});
    assert.deepEqual(tree.state('value').toDate(), [start.toDate(), end.toDate()]);

    // Component interaction should change the state.
    findCellByDate(tree, weekLater.start).simulate('click', {}, weekLater.start);
    findCellByDate(tree, weekLater.end).simulate('click', {}, weekLater.end);
    assert.deepEqual(tree.state('value').toDate(), weekLater.toDate());
  });

  it('supports selectionType=range with controlled behavior', function () {
    const start = moment(new Date(2016, 7, 1));
    const end = moment(new Date(2016, 7, 5));
    const tree = shallow(<Calendar selectionType="range" value={[start, end]} />);
    assert.deepEqual(tree.state('value'), new DateRange(start, end));

    const weekLater = new DateRange(start.clone().add(1, 'week'), end.clone().add(1, 'week'));

    // Changing value will change the state
    tree.setProps({value: weekLater});
    assert.deepEqual(tree.state('value').toDate(), weekLater.toDate());

    // Component interaction should not change the state, only manually setting value
    // as a prop will change the state.
    findCellByDate(tree, start).simulate('click', {}, start);
    findCellByDate(tree, end).simulate('click', {}, end);
    assert.deepEqual(tree.state('value').toDate(), weekLater.toDate());
  });

  describe('dispatches onChange', () => {
    let spy;

    const assertOnChangeArgsMatch = el => {
      const newDate = el.prop('date').clone();

      const args = spy.lastCall.args;
      assert.equal(+args[0], +newDate);
    };

    beforeEach(() => {
      spy = sinon.spy();
    });

    it('when a non-disabled day is clicked', () => {
      const tree = shallow(<Calendar onChange={spy} />);
      const firstNonSelectedCell = findFirstNonSelectedCell(tree);
      const firstNonSelectedCellDate = firstNonSelectedCell.prop('date');
      firstNonSelectedCell.simulate('click', {}, firstNonSelectedCellDate);
      assertOnChangeArgsMatch(firstNonSelectedCell);
    });

    it('when a focused day receives enter/space keydown event', () => {
      const tree = shallow(<Calendar onChange={spy} />);
      const preventDefaultSpy = sinon.spy();
      const firstNonSelectedCell = findFirstNonSelectedCell(tree);
      const firstNonSelectedCellDate = firstNonSelectedCell.prop('date');
      tree.setState({focusedDate: firstNonSelectedCellDate});
      findBody(tree).simulate('keydown', {keyCode: 13, preventDefault: preventDefaultSpy});
      assertOnChangeArgsMatch(firstNonSelectedCell);
      assert(preventDefaultSpy.called);
    });

    it('with a range when selectionType=range', function () {
      const tree = shallow(<Calendar onChange={spy} selectionType="range" />);
      const startCell = findFirstNonSelectedCell(tree);
      const endCell = findAllSelectableCells(tree).at(5);
      const startDate = startCell.prop('date');
      const endDate = endCell.prop('date');
      startCell.simulate('click', {}, startDate);
      endCell.simulate('click', {}, endDate);
      assert.deepEqual(spy.lastCall.args[0].toDate(), [startDate.toDate(), endDate.toDate()]);
    });
  });

  describe('currentMonth', () => {
    let now;
    let tree;

    beforeEach(() => {
      now = moment().startOf('day');
      tree = shallow(<Calendar value={now} />);
    });

    it('changes currentMonth when value prop is set to different day', () => {
      const date3MonthsLater = now.clone().add(3, 'month');
      assert.equal(+tree.state('currentMonth'), +now.clone().startOf('month'));
      tree.setProps({value: date3MonthsLater});
      assert.equal(+tree.state('currentMonth'), +date3MonthsLater.clone().startOf('month'));
    });

    it('changes currentMonth when previous or next buttons are clicked', () => {
      const previousMonth = now.clone().subtract(1, 'month');
      findPreviousButton(tree).simulate('click');
      assert.equal(+tree.state('focusedDate'), +previousMonth.clone());
      assert.equal(+tree.state('currentMonth'), +previousMonth.clone().startOf('month'));
      findNextButton(tree).simulate('click');
      assert.equal(+tree.state('focusedDate'), +now.clone());
      assert.equal(+tree.state('currentMonth'), +now.clone().startOf('month'));
    });
  });

  describe('focusedDate', () => {
    let now;
    let preventDefaultSpy;
    let tree;
    let body;

    const assertDateAfterKeyDown = ({keyCode, date, meta = false}) => {
      body.simulate('keydown', {preventDefault: preventDefaultSpy, keyCode, metaKey: meta});
      assert.equal(+tree.state('focusedDate'), +date.clone());
      assert.equal(+tree.state('currentMonth'), +date.clone().startOf('month'));
      assert.equal(+findFocusedCell(tree).prop('date'), +date.clone().startOf('day'));
      assert(preventDefaultSpy.called);
    };

    beforeEach(() => {
      now = moment().startOf('day');
      preventDefaultSpy = sinon.spy();
      tree = shallow(<Calendar value={now} />);
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
      tree = shallow(<Calendar value={date} />);
      assert.equal(+tree.state('focusedDate'), +moment(date, DEFAULT_VALUE_FORMAT));
    });

    it('is set to defaultValue if it exists', () => {
      const date = '2015-01-01';
      tree = shallow(<Calendar defaultValue={date} />);
      assert.equal(+tree.state('focusedDate'), +moment(date, DEFAULT_VALUE_FORMAT));
    });

    it('is set to now if no value or defaultValue exist', () => {
      tree = shallow(<Calendar />);
      assert.equal(tree.state('focusedDate').isSame(now, 'day'), true);
    });
  });

  describe('selectionType=range', function () {
    it('highlights the selected range when hovering over cells', function () {
      const before = moment().startOf('month').startOf('day');
      const start = before.clone().add(5, 'days');
      const after = start.clone().add(5, 'days');
      const tree = shallow(<Calendar selectionType="range" />);

      findCellByDate(tree, start).simulate('click', {}, start);
      assert.deepEqual(tree.state('selectingRange').toDate(), [start.toDate(), start.clone().endOf('day').toDate()]);

      findCellByDate(tree, before).simulate('highlight', {}, before);
      assert.deepEqual(tree.state('selectingRange').toDate(), [before.toDate(), start.toDate()]);

      findCellByDate(tree, after).simulate('highlight', {}, after);
      assert.deepEqual(tree.state('selectingRange').toDate(), [start.toDate(), after.toDate()]);
    });

    it('resets the selection when the escape key is pressed', function () {
      const before = moment().startOf('month').startOf('day');
      const start = before.clone().add(5, 'days');
      const tree = shallow(<Calendar selectionType="range" />);
      const body = findBody(tree);

      findCellByDate(tree, start).simulate('click', {}, start);
      findCellByDate(tree, before).simulate('highlight', {}, before);
      assert.deepEqual(tree.state('selectingRange').toDate(), [before.toDate(), start.toDate()]);

      body.simulate('keydown', {keyCode: 27});

      assert.equal(tree.state('selectingRange'), null);
    });
  });

  it('sets min and max to the start of the respective day', () => {
    const minDate = moment(new Date(2016, 9, 24, 12, 30));
    const maxDate = minDate.clone().add(3, 'day');
    const tree = shallow(<Calendar min={minDate} max={maxDate} />);
    assert.equal(+tree.state('min'), +minDate.startOf('day'));
    assert.equal(+tree.state('max'), +maxDate.startOf('day'));

    const minDateMinus1 = minDate.clone().subtract(1, 'day');
    const maxDatePlus1 = maxDate.clone().add(1, 'day');
    tree.setProps({min: minDateMinus1, max: maxDatePlus1});
    assert.equal(+tree.state('min'), +minDateMinus1.startOf('day'));
    assert.equal(+tree.state('max'), +maxDatePlus1.startOf('day'));
  });

  it('enforces min and max', () => {
    const date = moment('2015-01-01', DEFAULT_VALUE_FORMAT);
    const oneWeekLater = date.clone().add(1, 'week');
    const tree = shallow(<Calendar value={date} min={date} max={oneWeekLater} />);
    assert.equal(findAllSelectableCells(tree).length, 8); // includes start and end days
  });

  it('generateDateId', () => {
    const today = moment(new Date(2016, 7, 24));
    const tree = shallow(<Calendar value={today} />);
    assert.equal(tree.instance().generateDateId(today), 'react-coral-1-8/24/2016');
  });

  describe('CalendarCell', () => {
    let now;
    let tree;
    const dateStringForTitle = date => `${date.format('dddd')}, ${date.format('LL')}`;

    beforeEach(() => {
      now = moment();
      tree = shallow(<Calendar value={now} />);
    });

    describe('selected cell', () => {
      let cellTree;

      beforeEach(() => {
        cellTree = shallow(findFocusedCell(tree).node);
      });

      it('props', () => {
        assert.equal(cellTree.prop('id'), tree.instance().generateDateId(now));
        assert.equal(cellTree.prop('title'), `Today, ${dateStringForTitle(now)} selected`);
        assert.equal(cellTree.prop('aria-disabled'), false);
        assert.equal(cellTree.prop('aria-selected'), true);
        assert.equal(cellTree.prop('aria-invalid'), false);
        assert(cellTree.prop('onClick'));
        assert.equal(cellTree.childAt(0).text(), `${now.date()}`);
      });

      it('classes', () => {
        assert.equal(cellTree.hasClass('is-today'), true);
        assert.equal(cellTree.hasClass('is-selected'), true);
        assert.equal(cellTree.hasClass('coral-focus'), true);
        assert.equal(cellTree.childAt(0).hasClass('coral-Calendar-date'), true);
      });

      it('supports range selections', function () {
        const start = moment(new Date(2016, 7, 1));
        const end = moment(new Date(2016, 7, 5));
        const tree = shallow(<Calendar selectionType="range" value={[start, end]} />);

        const startCell = shallow(findCellByDate(tree, start).node).find('span');
        const midCell = shallow(findCellByDate(tree, start.clone().add(1, 'day')).node).find('span');
        const endCell = shallow(findCellByDate(tree, end).node).find('span');

        assert.equal(startCell.hasClass('is-range-selection'), true);
        assert.equal(startCell.hasClass('is-range-start'), true);
        assert.equal(startCell.hasClass('is-range-end'), false);

        assert.equal(midCell.hasClass('is-range-selection'), true);
        assert.equal(midCell.hasClass('is-range-start'), false);
        assert.equal(midCell.hasClass('is-range-end'), false);

        assert.equal(endCell.hasClass('is-range-selection'), true);
        assert.equal(endCell.hasClass('is-range-start'), false);
        assert.equal(endCell.hasClass('is-range-end'), true);
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
        assert.equal(cellTree.prop('id'), tree.instance().generateDateId(startOfNextMonth));
        assert.equal(cellTree.prop('title'), dateStringForTitle(startOfNextMonth));
        assert.equal(cellTree.prop('aria-disabled'), true);
        assert.equal(cellTree.prop('aria-selected'), false);
        assert.equal(cellTree.prop('aria-invalid'), false);
        assert(!cellTree.prop('onClick'));
        assert.equal(cellTree.childAt(0).text(), `${startOfNextMonth.date()}`);
      });

      it('classes', () => {
        assert.equal(cellTree.hasClass('is-today'), false);
        assert.equal(cellTree.hasClass('is-selected'), false);
        assert.equal(cellTree.hasClass('coral-focus'), false);
        assert.equal(cellTree.childAt(0).hasClass('coral-Calendar-secondaryDate'), true);
      });
    });
  });

  it('supports disabled', () => {
    const tree = shallow(<Calendar disabled />);
    assert.equal(tree.prop('aria-disabled'), true);
    assert.equal(tree.hasClass('is-disabled'), true);

    const body = findBody(tree);
    // every cell should be disabled
    assert.equal(body.find('tbody tr CalendarCell[disabled]').length, 42);
    assert.equal(body.prop('aria-disabled'), true);
  });

  it('supports invalid', () => {
    const tree = shallow(<Calendar invalid />);
    assert.equal(tree.prop('aria-invalid'), true);
    assert.equal(tree.hasClass('is-invalid'), true);
  });

  it('supports readOnly', () => {
    const tree = shallow(<Calendar readOnly />);
    assert.equal(tree.prop('aria-readonly'), true);
  });

  it('supports required', () => {
    const tree = shallow(<Calendar required />);
    assert.equal(tree.prop('aria-required'), true);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Calendar className="myClass" />);
    assert.equal(tree.hasClass('myClass'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Calendar foo />);
    assert.equal(tree.prop('foo'), true);
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
