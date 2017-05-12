import React from 'react';
import moment from 'moment';
import assert from 'assert';
import sinon from 'sinon';
import {shallow} from 'enzyme';
import Datepicker from '../../src/Datepicker';
import Textfield from '../../src/Textfield';
import Button from '../../src/Button';
import Calendar from '../../src/Calendar';
import Clock from '../../src/Clock';

const DEFAULT_DATE_VAL_FORMAT = 'YYYY-MM-DD';
const DEFAULT_TIME_VAL_FORMAT = 'HH:mm';
const DEFAULT_DATE_TIME_VAL_FORMAT = `${ DEFAULT_DATE_VAL_FORMAT } ${ DEFAULT_TIME_VAL_FORMAT }`;

describe('Datepicker', () => {
  it('default', () => {
    const tree = shallow(<Datepicker type="datetime" />);
    assert.equal(tree.hasClass('coral-Datepicker'), true);
    assert.equal(tree.hasClass('is-invalid'), false);

    const textfield = findTextfield(tree);
    assert.equal(textfield.hasClass('coral-InputGroup-input'), true);
    assert.equal(textfield.prop('aria-invalid'), false);
    assert.equal(textfield.prop('readOnly'), false);
    assert.equal(textfield.prop('disabled'), false);
    assert.equal(textfield.prop('invalid'), false);
    assert.equal(textfield.prop('quiet'), false);

    const button = findButton(tree);
    assert.equal(button.parent().hasClass('coral-InputGroup-button'), true);
    assert.equal(button.prop('icon'), 'calendar');
    assert.equal(button.prop('disabled'), false);
    assert.equal(button.hasClass('coral-Button--quiet'), false);

    const calendar = findCalendar(tree);
    assert.equal(calendar.hasClass('u-coral-borderless'), true);
    assert.equal(calendar.prop('disabled'), false);
    assert.equal(calendar.prop('invalid'), false);
    assert.equal(calendar.prop('readOnly'), false);
    assert.equal(calendar.prop('required'), false);

    const clock = findClock(tree);
    assert.equal(clock.parent().hasClass('coral-Datepicker-clockContainer'), true);
    assert.equal(clock.prop('disabled'), false);
    assert.equal(clock.prop('invalid'), false);
    assert.equal(clock.prop('readOnly'), false);
    assert.equal(clock.prop('required'), false);
  });

  it('supports type (date, time, and datetime)', () => {
    const tree = shallow(<Datepicker type="date" />);
    assert(findCalendar(tree).node);
    assert(!findClock(tree).node);
    assert.equal(findButton(tree).prop('icon'), 'calendar');

    tree.setProps({type: 'datetime'});
    assert(findCalendar(tree).node);
    assert(findClock(tree).node);
    assert.equal(findButton(tree).prop('icon'), 'calendar');

    tree.setProps({type: 'time'});
    assert(!findCalendar(tree).node);
    assert(findClock(tree).node);
    assert.equal(findButton(tree).prop('icon'), 'clock');
  });

  it('supports defaultValue uncontrolled behavior', () => {
    const now = moment();
    const tree = shallow(<Datepicker defaultValue={ now } />);

    // Setting defaultValue later doesn't change the state. Only component interactions
    // change the state.
    tree.setProps({defaultValue: now.clone().add(7, 'day')});
    assert.deepEqual(+tree.state('value'), +now);

    // Blurring the textfield should change the value state.
    findTextfield(tree).simulate('blur', {
      target: {value: '2016-08-01'}
    });
    assert.deepEqual(+tree.state('value'), +(new Date(2016, 7, 1)));
  });

  it('supports value controlled behavior', () => {
    const now = moment();
    const dateWeekLater = now.clone().add(7, 'day');

    const tree = shallow(<Datepicker value={ now } />);

    // Changing value will change the state
    tree.setProps({value: dateWeekLater});
    assert.deepEqual(+tree.state('value'), +dateWeekLater);

    // Component interaction should not change the state, only manually setting value
    // as a prop will change the state.
    findTextfield(tree).simulate('change', {
      stopPropagation: function () {},
      target: {value: '2016-08-01'}
    });
    assert.deepEqual(+tree.state('value'), +dateWeekLater);
  });

  it('clicking Button opens Popover', () => {
    const tree = shallow(<Datepicker />);
    assert.equal(tree.state('open'), false);
    findButton(tree).simulate('click');
    assert.equal(tree.state('open'), true);
    assert.equal(tree.prop('open'), true);
  });

  describe('closing popover', () => {
    it('typing escape while popover is open closes popover', () => {
      const tree = shallow(<Datepicker type="datetime" />);
      tree.setState({open: true});
      findCalendar(tree).simulate('keydown', {keyCode: 27});
      assert.equal(tree.state('open'), false);
      tree.setState({open: true});
      findClock(tree).simulate('keydown', {keyCode: 27});
      assert.equal(tree.state('open'), false);
    });

    it('clicking a date on the calendar closes popover', () => {
      const now = moment();
      const tree = shallow(<Datepicker />);
      tree.setState({open: true});
      findCalendar(tree).simulate('change', now);
      assert.equal(tree.state('open'), false);
    });

    it('popover can close itself', () => {
      const tree = shallow(<Datepicker />);
      tree.prop('onClose')();
      assert.equal(tree.state('open'), false);
    });
  });

  describe('onBlur', () => {
    it('calls onBlur when text input is blurred', () => {
      const spy = sinon.spy();
      const event = {target: {value: '2016-08-01 00:00'}};
      const tree = shallow(<Datepicker onBlur={ spy } />);
      findTextfield(tree).simulate('blur', event);
      assert(spy.calledWith(event));
    });
  });

  describe('onChange', () => {
    let spy;
    let tree;
    const assertChangeArgs = (el, args, inputText, date) => {
      args.unshift('change');
      el.simulate(...args);
      const callArgs = spy.lastCall.args;
      assert.equal(callArgs[0], inputText);
      assert.deepEqual(+callArgs[1], +date);
    };

    beforeEach(() => {
      spy = sinon.spy();
      tree = shallow(<Datepicker type="datetime" onChange={ spy } />);
    });

    it('textfield onChange', () => {
      const textfield = findTextfield(tree);
      const simulatedGoodEvent = {
        stopPropagation: function () {},
        target: {value: '2016-08-01 00:00'}
      };
      const simulatedBadEvent = {
        stopPropagation: function () {},
        target: {value: 'foo'}
      };

      textfield.simulate('change', simulatedGoodEvent);
      assert(!spy.called);

      textfield.simulate('blur', simulatedGoodEvent);
      const firstCallArgs = spy.lastCall.args;
      assert.equal(firstCallArgs[0], '2016-08-01 00:00');
      assert.equal(+firstCallArgs[1], +(new Date(2016, 7, 1)));

      textfield.simulate('blur', simulatedBadEvent);
      const secondCallArgs = spy.lastCall.args;
      assert.equal(secondCallArgs[0], 'foo');
      assert.equal(secondCallArgs[1], null);
    });

    it('calendar onChange', () => {
      const calendar = findCalendar(tree);
      const text = '2016-08-01 00:00';
      const date = moment(text, DEFAULT_DATE_VAL_FORMAT);
      assertChangeArgs(calendar, [date], text, date);
    });

    it('calendar onChange with displayFormat', () => {
      tree.setProps({displayFormat: DEFAULT_DATE_VAL_FORMAT});

      const calendar = findCalendar(tree);
      const text = '2016-08-01';
      const date = moment(text, DEFAULT_DATE_VAL_FORMAT);
      assertChangeArgs(calendar, [date], text, date);
    });

    it('clock onChange', () => {
      const calendar = findCalendar(tree);
      const text = '2016-08-01 12:35';
      const date = moment(text, DEFAULT_DATE_TIME_VAL_FORMAT);
      assertChangeArgs(calendar, [date], text, date);
    });

    it('clock onChange with displayFormat', () => {
      tree.setProps({displayFormat: 'YYYY-MM-DD hh:mm:ss'});

      const calendar = findCalendar(tree);
      const text = '2016-08-01 12:35:00';
      const date = moment(text, DEFAULT_DATE_TIME_VAL_FORMAT);
      assertChangeArgs(calendar, [date], text, date);
    });

    describe('maintains month, day, and year when hour/minute changes are made', () => {
      const date = new Date(2001, 0, 1);

      const changeTimeAndGetNewDate = (wrapper, value, field) => {
        const clockEl = shallow(findClock(wrapper).node).find(`.coral-Clock-${ field }`);
        clockEl.simulate('change', {stopPropagation: function () {}, target: {value: `${ value }`}});
        return spy.lastCall.args[1];
      };

      beforeEach(() => {
        spy = sinon.spy();
      });

      it('when controlled', () => {
        tree = shallow(<Datepicker type="datetime" onChange={ spy } value={ date } />);
        let newDate = changeTimeAndGetNewDate(tree, 10, 'hour');
        const newTree = tree.setProps({value: newDate});
        newDate = changeTimeAndGetNewDate(newTree, 15, 'minute');
        assert.equal(+newDate, +moment(date).hour(10).minute(15));
      });

      it('when not controlled', () => {
        tree = shallow(<Datepicker type="datetime" onChange={ spy } defaultValue={ date } />);
        let newDate = changeTimeAndGetNewDate(tree, 10, 'hour');
        // changeTimeAndGetNewDate is called setState internally. In order for this change to
        // be reflected in the shallow render tree, we need to call update.
        tree = tree.update();
        newDate = changeTimeAndGetNewDate(tree, 15, 'minute');
        assert.equal(+newDate, +moment(date).hour(10).minute(15));
      });
    });
  });

  it('supports placeholder', () => {
    const tree = shallow(<Datepicker placeholder="foo" />);
    assert.equal(findTextfield(tree).prop('placeholder'), 'foo');
  });

  it('supports quiet', () => {
    const tree = shallow(<Datepicker quiet />);
    assert.equal(tree.childAt(0).prop('quiet'), true);
    assert.equal(findTextfield(tree).prop('quiet'), true);
    assert.equal(findButton(tree).hasClass('coral-Button--quiet'), true);
  });

  it('supports disabled', () => {
    const tree = shallow(<Datepicker type="datetime" disabled />);
    assert.equal(tree.prop('aria-disabled'), true);
    assert.equal(findTextfield(tree).prop('disabled'), true);
    assert.equal(findButton(tree).prop('disabled'), true);
    assert.equal(findCalendar(tree).prop('disabled'), true);
    assert.equal(findClock(tree).prop('disabled'), true);
  });

  it('supports invalid', () => {
    const tree = shallow(<Datepicker type="datetime" invalid />);
    assert.equal(tree.prop('aria-invalid'), true);
    assert.equal(tree.hasClass('is-invalid'), true);
    assert.equal(findTextfield(tree).prop('invalid'), true);
    assert.equal(findTextfield(tree).prop('aria-invalid'), true);
    assert.equal(findCalendar(tree).prop('invalid'), true);
    assert.equal(findClock(tree).prop('invalid'), true);
  });

  it('supports readOnly', () => {
    const tree = shallow(<Datepicker type="datetime" readOnly />);
    assert.equal(tree.prop('aria-readonly'), true);
    assert.equal(findTextfield(tree).prop('readOnly'), true);
    assert.equal(findButton(tree).prop('disabled'), true);
    assert.equal(findCalendar(tree).prop('readOnly'), true);
    assert.equal(findClock(tree).prop('readOnly'), true);
  });

  it('supports required', () => {
    const tree = shallow(<Datepicker type="datetime" required />);
    assert.equal(tree.prop('aria-required'), true);
    assert.equal(findCalendar(tree).prop('required'), true);
    assert.equal(findClock(tree).prop('required'), true);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Datepicker className="myClass" />);
    assert.equal(tree.hasClass('myClass'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Datepicker foo />);
    assert.equal(findTextfield(tree).prop('foo'), true);
  });
});

const findTextfield = tree => tree.find(Textfield);
const findButton = tree => tree.find(Button);
const findCalendar = tree => shallow(tree.prop('content')).find(Calendar);
const findClock = tree => shallow(tree.prop('content')).find(Clock);
