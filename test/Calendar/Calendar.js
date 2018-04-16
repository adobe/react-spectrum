import assert from 'assert';
import Calendar from '../../src/Calendar';
import createId from '../../src/utils/createId';
import {DateRange} from 'moment-range';
import moment from 'moment';
import {mount, shallow} from 'enzyme';
import {rAF} from '../utils';
import React from 'react';
import sinon from 'sinon';

describe('Calendar', () => {
  const DEFAULT_VALUE_FORMAT = 'YYYY-MM-DD';
  const DEFAULT_HEADER_FORMAT = 'MMMM YYYY';

  it('default', () => {
    const now = moment();

    const tree = shallow(<Calendar />);
    assert.equal(tree.hasClass('spectrum-Calendar'), true);
    assert.equal(tree.prop('role'), 'group');

    const headerTitle = findHeaderTitle(tree);
    assert.equal(headerTitle.text(), now.format(DEFAULT_HEADER_FORMAT));
    assert.equal(tree.prop('aria-labelledby'), headerTitle.prop('id'));

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

    tree.instance().componentWillMount();

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
    const head = tree.find('.spectrum-Calendar-body thead tr th').first();
    assert.equal(head.childAt(0).prop('title'), 'Tuesday');
    assert.equal(head.childAt(0).text(), 'Tu');
  });

  it('supports headerFormat', () => {
    const tree = shallow(<Calendar value="2016-08-01" headerFormat="M/YYYY" />);
    assert.equal(findHeaderTitle(tree).text(), '8/2016');
  });

  it('supports valueFormat', () => {
    const tree = shallow(<Calendar value="08-01-2016" valueFormat="MM-DD-YYYY" />);
    tree.instance().componentWillMount();
    assert.equal(+tree.state('value'), +new Date(2016, 7, 1));
    tree.setProps({value: '01-08-2016'});
    assert.equal(+tree.state('value'), +new Date(2016, 0, 8));
  });

  it('supports selectionType=range', function () {
    const start = moment(new Date(2016, 7, 1));
    const end = moment(new Date(2016, 7, 5));
    const tree = shallow(<Calendar selectionType="range" value={[start, end]} />);
    tree.instance().componentWillMount();
    assert.deepEqual(tree.state('value'), new DateRange(start, end));
  });

  it('supports selectionType=range with uncontrolled behavior', function () {
    const start = moment(new Date(2016, 7, 1));
    const end = moment(new Date(2016, 7, 5));
    const tree = shallow(<Calendar selectionType="range" defaultValue={[start, end]} />);
    tree.instance().componentWillMount();
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
    tree.instance().componentWillMount();
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

  describe('dispatches onFocus', () => {
    it('when table body receives focus', () => {
      const spy = sinon.spy();
      const tree = shallow(<Calendar onFocus={spy} />);
      tree.instance().componentWillMount();
      const body = findBody(tree);
      body.simulate('focus');
      assert(tree.state('isFocused'));
      assert(spy.called);
    });
  });

  describe('dispatches onBlur', () => {
    it('when table body loses focus', () => {
      const spy = sinon.spy();
      const tree = shallow(<Calendar onBlur={spy} />);
      tree.instance().componentWillMount();
      const body = findBody(tree);
      body.simulate('focus');
      assert(tree.state('isFocused'));
      body.simulate('blur');
      assert(!tree.state('isFocused'));
      assert(spy.called);
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

    it('changes currentMonth when previous or next buttons are clicked', (done) => {
      const previousMonth = now.clone().subtract(1, 'month');
      findPreviousButton(tree).simulate('focus');
      assert.equal(tree.instance().state.ariaLiveHeading, 'assertive');
      findPreviousButton(tree).simulate('click');
      assert.equal(+tree.state('currentMonth'), +previousMonth.clone().startOf('month'));
      findPreviousButton(tree).simulate('blur');
      assert.equal(tree.instance().state.ariaLiveHeading, 'assertive');
      findNextButton(tree).simulate('focus');
      findNextButton(tree).simulate('click');
      assert.equal(+tree.state('currentMonth'), +now.clone().startOf('month'));
      findNextButton(tree).simulate('blur');
      requestAnimationFrame(() => {
        assert.equal(tree.instance().state.ariaLiveHeading, 'off');
        done();
      });
    });
  });

  describe('focusedDate', () => {
    let now;
    let preventDefaultSpy;
    let tree;
    let body;

    const assertDateAfterKeyDown = async ({keyCode, date, meta = false}) => {
      body.simulate('focus');
      body.simulate('keydown', {preventDefault: preventDefaultSpy, keyCode, metaKey: meta});
      assert.equal(+tree.state('focusedDate'), +date.clone());
      assert.equal(+tree.state('currentMonth'), +date.clone().startOf('month'));
      assert.equal(+findFocusedCell(tree).prop('date'), +date.clone().startOf('day'));
      assert(preventDefaultSpy.called);

      // wait for render to test aria-activedescendant attribute
      await rAF(() => {
        tree.update();
        assert.equal(body.prop('aria-activedescendant'), findFocusedCell(tree).prop('id'));
      });
    };

    beforeEach(() => {
      now = moment().startOf('day');
      preventDefaultSpy = sinon.spy();
      tree = shallow(<Calendar value={now} />);
      tree.instance().componentWillMount();
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
      assertDateAfterKeyDown({keyCode: 34, date: previousMonth.clone().add(1, 'month')});
    });

    it('increments/decrements one year with cmd + page up/down', () => {
      const previousYear = now.clone().subtract(1, 'year');
      assertDateAfterKeyDown({keyCode: 33, date: previousYear, meta: true});
      assertDateAfterKeyDown({keyCode: 34, date: now, meta: true});
    });

    it('is set to value if it exists', async () => {
      const date = '2015-01-01';
      tree = shallow(<Calendar value={date} />);
      tree.instance().componentWillMount();
      await rAF(() => {
        tree.update();
        assert.equal(+tree.state('focusedDate'), +moment(date, DEFAULT_VALUE_FORMAT));
      });
    });

    it('is set to defaultValue if it exists', async () => {
      const date = '2015-01-01';
      tree = shallow(<Calendar defaultValue={date} />);
      tree.instance().componentWillMount();
      await rAF(() => {
        tree.update();
        assert.equal(+tree.state('focusedDate'), +moment(date, DEFAULT_VALUE_FORMAT));
      });
    });

    it('is set to now if no value or defaultValue exist', async () => {
      tree = shallow(<Calendar />);
      tree.instance().componentWillMount();
      await rAF(() => {
        tree.update();
        assert(tree.state('focusedDate').isSame(now, 'day'));
      });
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

    it('indicates the selected range using table caption and aria-describedby on the body', function () {
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

      findCellByDate(tree, after).simulate('click', {}, after);
      assert.deepEqual(tree.state('highlightedRange').toDate(), [start.toDate(), after.toDate()]);

      const tableCaption = findTableCaption(tree);
      assert.equal(tableCaption.text(), `Selected Range: ${start.format('LL')} to ${after.format('LL')}`);

      assert.equal(findBody(tree).prop('aria-describedby'), tableCaption.prop('id'));
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

    describe('highlights the selected range when navigating using the keyboard', () => {
      let now;
      let tree;
      let body;

      const assertDateAfterKeyDown = async ({keyCode, meta = false}) => {
        body.simulate('focus');
        body.simulate('keydown', {preventDefault: () => {}, keyCode, metaKey: meta});
        // wait for render
        await rAF(() => {
          tree.update();
        });
      };

      beforeEach(() => {
        now = moment().startOf('day');
        tree = shallow(<Calendar selectionType="range" />);
        tree.instance().componentWillMount();
        body = findBody(tree);
        body.simulate('focus');
        tree.instance().focusTimeUnit(now);
      });

      it('adds appropriate selection prompt to aria-label of focused cell', () => {
        const nextWeek = now.clone().add(1, 'week');
        const rangeSelectionStartPrompt = ' (Click to start selecting date range)';
        const rangeSelectionFinishPrompt = ' (Click to finish selecting date range)';
        let renderedCell = findCellByDate(tree, now).render();
        assert.equal(renderedCell.prop('aria-label').indexOf(rangeSelectionStartPrompt), renderedCell.prop('aria-label').length - rangeSelectionStartPrompt.length);
        findCellByDate(tree, now).simulate('click', {}, now);
        renderedCell = findCellByDate(tree, now).render();
        assert.equal(renderedCell.prop('aria-label').indexOf(rangeSelectionFinishPrompt), renderedCell.prop('aria-label').length - rangeSelectionFinishPrompt.length);
        assertDateAfterKeyDown({keyCode: 40}); // down arrow
        assert.deepEqual(tree.state('selectingRange').toDate(), [now.toDate(), nextWeek.toDate()]);
        renderedCell = findCellByDate(tree, nextWeek).render();
        assert.equal(renderedCell.prop('aria-label').indexOf(rangeSelectionFinishPrompt), renderedCell.prop('aria-label').length - rangeSelectionFinishPrompt.length);
        findCellByDate(tree, nextWeek).simulate('click', {}, nextWeek);
        renderedCell = findCellByDate(tree, nextWeek).render();
        assert.equal(renderedCell.prop('aria-label').indexOf(rangeSelectionFinishPrompt), -1);
        assert.equal(renderedCell.prop('aria-label').indexOf(rangeSelectionStartPrompt), -1);
      });

      it('increments/decrements one day with left/right arrows', async () => {
        const previousDay = now.clone().subtract(1, 'day');
        findCellByDate(tree, now).simulate('click', {}, now);
        assert.deepEqual(tree.state('selectingRange').toDate(), [now.toDate(), now.clone().endOf('day').toDate()]);
        assertDateAfterKeyDown({keyCode: 37}); // left arrow
        assert.deepEqual(tree.state('selectingRange').toDate(), [previousDay.toDate(), now.toDate()]);
        assertDateAfterKeyDown({keyCode: 39}); // right arrow
        assert.deepEqual(tree.state('selectingRange').toDate(), [now.toDate(), now.toDate()]);
      });

      it('increments/decrements one week with up/down arrows', () => {
        const previousWeek = now.clone().subtract(1, 'week');
        findCellByDate(tree, now).simulate('click', {}, now);
        assert.deepEqual(tree.state('selectingRange').toDate(), [now.toDate(), now.clone().endOf('day').toDate()]);
        assertDateAfterKeyDown({keyCode: 38}); // up arrow
        assert.deepEqual(tree.state('selectingRange').toDate(), [previousWeek.toDate(), now.toDate()]);
        assertDateAfterKeyDown({keyCode: 40}); // down arrow
        assert.deepEqual(tree.state('selectingRange').toDate(), [now.toDate(), now.toDate()]);
      });

      it('goes to beginning/end of month with home and end keys', () => {
        const monthBegin = now.clone().startOf('month').startOf('day');
        const monthEnd = now.clone().endOf('month').startOf('day');
        findCellByDate(tree, now).simulate('click', {}, now);
        assert.deepEqual(tree.state('selectingRange').toDate(), [now.toDate(), now.clone().endOf('day').toDate()]);
        assertDateAfterKeyDown({keyCode: 36}); // home
        assert.deepEqual(tree.state('selectingRange').toDate(), [monthBegin.toDate(), now.toDate()]);
        assertDateAfterKeyDown({keyCode: 35}); // end
        assert.deepEqual(tree.state('selectingRange').toDate(), [now.toDate(), monthEnd.toDate()]);
      });

      it('increments/decrements one month with page up/down', () => {
        const previousMonth = now.clone().subtract(1, 'month');
        findCellByDate(tree, now).simulate('click', {}, now);
        assert.deepEqual(tree.state('selectingRange').toDate(), [now.toDate(), now.clone().endOf('day').toDate()]);
        assertDateAfterKeyDown({keyCode: 33});
        assert.deepEqual(tree.state('selectingRange').toDate(), [previousMonth.toDate(), now.toDate()]);
        assertDateAfterKeyDown({keyCode: 34});
        assert.deepEqual(tree.state('selectingRange').toDate(), [previousMonth.clone().add(1, 'month').toDate(), now.toDate()]);
      });

      it('increments/decrements one year with cmd + page up/down', () => {
        const previousYear = now.clone().subtract(1, 'year');
        findCellByDate(tree, now).simulate('click', {}, now);
        assert.deepEqual(tree.state('selectingRange').toDate(), [now.toDate(), now.clone().endOf('day').toDate()]);
        assertDateAfterKeyDown({keyCode: 33, meta: true});
        assert.deepEqual(tree.state('selectingRange').toDate(), [previousYear.toDate(), now.toDate()]);
        assertDateAfterKeyDown({keyCode: 34, meta: true});
        assert.deepEqual(tree.state('selectingRange').toDate(), [now.toDate(), now.toDate()]);
      });
    });
  });

  it('sets min and max to the start of the respective day', () => {
    const minDate = moment(new Date(2016, 9, 24, 12, 30));
    const maxDate = minDate.clone().add(3, 'day');
    const tree = shallow(<Calendar min={minDate} max={maxDate} />);
    tree.instance().componentWillMount();
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
    tree.instance().componentWillMount();
    tree.update();
    assert.equal(findAllSelectableCells(tree).length, 8); // includes start and end days
    findCellByDate(tree, date).simulate('click', {}, date);
    const body = findBody(tree);
    body.simulate('focus');
    body.simulate('keydown', {preventDefault: () => {}, keyCode: 37});
    assert(tree.state('focusedDate').isSame(date));
    findCellByDate(tree, oneWeekLater).simulate('click', {}, oneWeekLater);
    body.simulate('focus');
    body.simulate('keydown', {preventDefault: () => {}, keyCode: 39});
    assert(tree.state('focusedDate').isSame(oneWeekLater));
  });

  it('generateDateId', () => {
    const index = parseInt(createId().substring(15), 10) + 1;
    const today = moment(new Date(2016, 7, 24));
    const tree = shallow(<Calendar value={today} />);
    assert.equal(tree.instance().generateDateId(today), 'react-spectrum-' + index + '-2016/08/24');
  });

  describe('CalendarCell', () => {
    let now;
    let tree;
    const dateStringForTitle = date => `${date.format('dddd')}, ${date.format('LL')}`;

    beforeEach(() => {
      now = moment();
      tree = shallow(<Calendar value={now} />);
      findBody(tree).simulate('focus');
    });

    describe('selected cell', () => {
      let cellTree, dateNode;

      beforeEach(() => {
        cellTree = shallow(findFocusedCell(tree).getElement());
        dateNode = cellTree.find('.spectrum-Calendar-date');
      });

      it('props', () => {
        assert.equal(cellTree.prop('id'), tree.instance().generateDateId(now));
        assert.equal(cellTree.prop('title'), `Today, ${dateStringForTitle(now)} selected`);
        assert.equal(cellTree.prop('aria-disabled'), false);
        assert.equal(cellTree.prop('aria-selected'), true);
        assert.equal(cellTree.prop('aria-invalid'), false);
        assert(cellTree.prop('onClick'));
        assert(cellTree.prop('onMouseEnter'));
        assert.equal(cellTree.childAt(0).text(), `${now.date()}`);
      });

      it('classes', () => {
        assert.equal(dateNode.hasClass('is-today'), true);
        assert.equal(dateNode.hasClass('is-selected'), true);
        assert.equal(dateNode.hasClass('is-focused'), true);
      });

      it('supports range selections', function () {
        const start = moment(new Date(2016, 7, 1));
        const end = moment(new Date(2016, 7, 5));
        const tree = shallow(<Calendar selectionType="range" value={[start, end]} />);

        const startCell = shallow(findCellByDate(tree, start).getElement()).find('span');
        const midCell = shallow(findCellByDate(tree, start.clone().add(1, 'day')).getElement()).find('span');
        const endCell = shallow(findCellByDate(tree, end).getElement()).find('span');

        assert.equal(startCell.hasClass('is-range-selection'), true);
        assert.equal(midCell.hasClass('is-range-selection'), true);
        assert.equal(endCell.hasClass('is-range-selection'), true);
      });

      it('supports click event', function () {
        const start = moment(new Date(2016, 7, 14));
        const tree = shallow(<Calendar value={start} />);
        findBody(tree).simulate('focus');

        assert(start.isSame(tree.state('focusedDate')));

        const nextDate = start.clone().add(-7, 'day');

        const nextCell = shallow(findCellByDate(tree, nextDate).getElement());

        nextCell.simulate('click', {preventDefault: () => {}});

        assert(nextDate.isSame(tree.state('focusedDate')));
      });

      it('supports mouseDown event', function () {
        const start = moment(new Date(2016, 7, 14));
        const tree = shallow(<Calendar value={start} />);
        findBody(tree).simulate('focus');

        assert(start.isSame(tree.state('focusedDate')));

        const nextDate = start.clone().add(-7, 'day');

        const nextCell = shallow(findCellByDate(tree, nextDate).getElement());

        nextCell.simulate('mouseDown', {preventDefault: () => {}});

        assert(nextDate.isSame(tree.state('focusedDate')));
      });

      it('supports mouseEnter event', function () {
        const spy = sinon.spy();
        const start = moment(new Date(2016, 7, 14));
        const tree = shallow(<Calendar selectionType="range" value={start} />);
        tree.instance().onHighlight = spy;
        findBody(tree).simulate('focus');

        const nextDate = start.clone().add(-7, 'day');

        const nextCell = shallow(findCellByDate(tree, nextDate).getElement());

        nextCell.simulate('click', {preventDefault: () => {}});

        nextCell.simulate('mouseenter');

        assert(spy.called);
      });
    });

    describe('disabled cell', () => {
      let cellTree, dateNode;
      let startOfNextMonth;

      beforeEach(() => {
        startOfNextMonth = moment()
          .endOf('month')
          .add(1, 'day')
          .startOf('day');
        cellTree = shallow(findCellByDate(tree, startOfNextMonth).getElement());
        dateNode = cellTree.find('.spectrum-Calendar-date');
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
        assert.equal(dateNode.hasClass('is-today'), false);
        assert.equal(dateNode.hasClass('is-selected'), false);
        assert.equal(dateNode.hasClass('is-focused'), false);
        assert.equal(dateNode.hasClass('is-disabled'), true);
      });
    });
  });

  it('supports disabled', () => {
    const tree = shallow(<Calendar disabled />);

    const body = findBody(tree);
    // every cell should be disabled
    assert.equal(body.find('tbody tr CalendarCell[disabled]').length, 42);
    assert.equal(body.prop('aria-disabled'), true);
  });

  it('supports readOnly', () => {
    const tree = shallow(<Calendar readOnly />);
    const body = findBody(tree);
    assert.equal(body.prop('aria-readonly'), true);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Calendar className="myClass" />);
    assert.equal(tree.hasClass('myClass'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Calendar foo />);
    assert.equal(tree.prop('foo'), true);
  });

  describe('When aria-labelledby prop', () => {
    describe('is undefined,', () => {
      it('calendar has aria-labelledby prop referencing header element id.', () => {
        const tree = shallow(<Calendar />);
        const body = findBody(tree);
        const headerTitle = findHeaderTitle(tree);
        assert.equal(tree.prop('aria-labelledby'), headerTitle.prop('id'));
        assert.equal(body.prop('aria-labelledby'), headerTitle.prop('id'));
      });
    });
    describe('is defined,', () => {
      it('calendar has aria-labelledby prop that includes both the aria-labelledby prop and the header element id.', () => {
        const tree = shallow(<Calendar aria-labelledby="foo" />);
        const body = findBody(tree);
        const headerTitle = findHeaderTitle(tree);
        assert.equal(tree.prop('aria-labelledby'), 'foo' + ' ' + headerTitle.prop('id'));
        assert.equal(body.prop('aria-labelledby'), 'foo' + ' ' + headerTitle.prop('id'));
      });
    });
  });

  it('sets aria-live="off" to live regions on blur', (done) => {
    const tree = shallow(<Calendar />);
    const body = findBody(tree);
    tree.setState({
      ariaLiveHeading: 'polite',
      ariaLiveCaption: 'polite'
    });
    tree.update();
    body.simulate('blur');
    body.simulate('focus');
    assert.equal(findHeaderTitle(tree).prop('aria-live'), 'polite');
    assert.equal(findTableCaption(tree).prop('aria-live'), 'polite');
    body.simulate('blur');
    requestAnimationFrame(() => {
      assert.equal(tree.instance().state.ariaLiveHeading, 'off');
      assert.equal(tree.instance().state.ariaLiveCaption, 'off');
      tree.update();
      assert.equal(findHeaderTitle(tree).prop('aria-live'), 'off');
      assert.equal(findTableCaption(tree).prop('aria-live'), 'off');
      done();
    });
  });

  it('focusCalendarBody moves focus to calendarBody', async () => {
    const tree = mount(<Calendar />);
    const body = findBody(tree);
    tree.instance().focusCalendarBody();

    await rAF(async () => {
      // body should be focused on next animation frame
      assert.equal(body.getDOMNode(), document.activeElement);

      // test blur before restoring focus
      tree.instance().focusCalendarBody();
      assert.equal(document.body, document.activeElement);
      await rAF(() => {
        assert.equal(body.getDOMNode(), document.activeElement);
      });
    });
  });

  it('supports autoFocus', async () => {
    const tree = mount(<Calendar autoFocus />);
    const body = findBody(tree);

    await rAF(() => {
      // body should be focused on next animation frame
      assert.equal(body.getDOMNode(), document.activeElement);
    });
  });
});

const findHeaderTitle = tree => tree.find('.spectrum-Calendar-header').childAt(0);
const findPreviousButton = tree => tree.find('.spectrum-Calendar-header').childAt(1);
const findNextButton = tree => tree.find('.spectrum-Calendar-header').childAt(2);
const findBody = tree => tree.find('.spectrum-Calendar-body');
const findAllCells = tree => findBody(tree).find('tbody tr CalendarCell');
const findAllSelectableCells = tree => (
  findAllCells(tree)
  .filterWhere(c => !c.prop('disabled'))
);
const findFirstNonSelectedCell = tree => findAllSelectableCells(tree).first();
const findFocusedCell = tree => findBody(tree).find('tbody tr CalendarCell[focused=true]');
const findCellByDate = (tree, date) =>
  findAllCells(tree).filterWhere(c => +c.prop('date') === +date);
const findTableCaption = tree => tree.find('.react-spectrum-Calendar-tableCaption');
