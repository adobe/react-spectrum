import assert from 'assert';
import Button from '../../src/Button';
import Calendar from '../../src/Calendar';
import CalendarIcon from '../../src/Icon/Calendar';
import Clock from '../../src/Clock';
import ClockIcon from '../../src/Icon/Clock';
import Datepicker from '../../src/Datepicker';
import moment from 'moment';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import Textfield from '../../src/Textfield';

const DEFAULT_DATE_VAL_FORMAT = 'YYYY-MM-DD';
const DEFAULT_TIME_VAL_FORMAT = 'HH:mm';
const DEFAULT_DATE_TIME_VAL_FORMAT = `${DEFAULT_DATE_VAL_FORMAT} ${DEFAULT_TIME_VAL_FORMAT}`;

describe('Datepicker', () => {
  it('default', () => {
    const tree = shallow(<Datepicker type="datetime" />);
    assert.equal(tree.hasClass('spectrum-Datepicker'), true);
    assert.equal(tree.hasClass('is-invalid'), false);

    const textfield = findTextfield(tree);
    assert.equal(textfield.hasClass('spectrum-InputGroup-input'), true);
    assert.equal(textfield.prop('aria-invalid'), false);
    assert.equal(textfield.prop('readOnly'), false);
    assert.equal(textfield.prop('disabled'), false);
    assert.equal(textfield.prop('invalid'), false);
    assert.equal(textfield.prop('quiet'), false);

    const button = findButton(tree);
    assert.equal(button.hasClass('spectrum-InputGroup-button'), true);
    assert.equal(button.prop('icon').type, CalendarIcon);
    assert.equal(button.prop('disabled'), false);
    assert.equal(button.prop('quiet'), false);

    const calendar = tree.find(Calendar);
    assert.equal(calendar.prop('disabled'), false);
    assert.equal(calendar.prop('invalid'), false);
    assert.equal(calendar.prop('readOnly'), false);
    assert.equal(calendar.prop('required'), false);

    const clock = tree.find(Clock);
    assert.equal(clock.parent().hasClass('react-spectrum-Datepicker-clockContainer'), true);
    assert.equal(clock.prop('disabled'), false);
    assert.equal(clock.prop('invalid'), false);
    assert.equal(clock.prop('readOnly'), false);
    assert.equal(clock.prop('required'), false);

    assert.equal(tree.find('OverlayTrigger').prop('placement'), 'right');
  });

  it('supports type (date, time, and datetime)', () => {
    const tree = shallow(<Datepicker type="date" />);

    assert.equal(tree.find(Calendar).length, 1);
    assert.equal(tree.find(Clock).length, 0);
    assert.equal(findButton(tree).prop('icon').type, CalendarIcon);

    tree.setProps({type: 'datetime'});
    assert.equal(tree.find(Calendar).length, 1);
    assert.equal(tree.find(Clock).length, 1);
    assert.equal(findButton(tree).prop('icon').type, CalendarIcon);

    tree.setProps({type: 'time'});
    assert.equal(tree.find(Calendar).length, 0);
    assert.equal(tree.find(Clock).length, 1);
    assert.equal(findButton(tree).prop('icon').type, ClockIcon);
  });

  it('supports defaultValue uncontrolled behavior', () => {
    const now = moment();
    const tree = shallow(<Datepicker defaultValue={now} />);

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

    const tree = shallow(<Datepicker value={now} />);

    // Changing value will change the state
    tree.setProps({value: dateWeekLater});
    assert.deepEqual(+tree.state('value'), +dateWeekLater);

    // Component interaction should not change the state, only manually setting value
    // as a prop will change the state.
    findTextfield(tree).simulate('change', '2016-08-01', {
      stopPropagation: function () {},
      target: {value: '2016-08-01'}
    });
    assert.deepEqual(+tree.state('value'), +dateWeekLater);
  });

  describe('onBlur', () => {
    it('calls onBlur when text input is blurred', () => {
      const spy = sinon.spy();
      const event = {target: {value: '2016-08-01 00:00'}};
      const tree = shallow(<Datepicker onBlur={spy} />);
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
      tree = shallow(<Datepicker type="datetime" onChange={spy} />);
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

      textfield.simulate('change', '2016-08-01 00:00', simulatedGoodEvent);
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
      const calendar = tree.find(Calendar);
      const text = '2016-08-01 00:00';
      const date = moment(text, DEFAULT_DATE_VAL_FORMAT);
      assertChangeArgs(calendar, [date], text, date);
    });

    it('calendar onChange with displayFormat', () => {
      tree.setProps({displayFormat: DEFAULT_DATE_VAL_FORMAT});

      const calendar = tree.find(Calendar);
      const text = '2016-08-01';
      const date = moment(text, DEFAULT_DATE_VAL_FORMAT);
      assertChangeArgs(calendar, [date], text, date);
    });

    it('clock onChange', () => {
      const calendar = tree.find(Calendar);
      const text = '2016-08-01 12:35';
      const date = moment(text, DEFAULT_DATE_TIME_VAL_FORMAT);
      assertChangeArgs(calendar, [date], text, date);
    });

    it('clock onChange with displayFormat', () => {
      tree.setProps({displayFormat: 'YYYY-MM-DD hh:mm:ss'});

      const calendar = tree.find(Calendar);
      const text = '2016-08-01 12:35:00';
      const date = moment(text, DEFAULT_DATE_TIME_VAL_FORMAT);
      assertChangeArgs(calendar, [date], text, date);
    });

    describe('maintains month, day, and year when hour/minute changes are made', () => {
      const date = new Date(2001, 0, 1);

      const changeTimeAndGetNewDate = (wrapper, value, field) => {
        const clockEl = shallow(wrapper.find(Clock).getElement()).find(`.react-spectrum-Clock-${field}`);
        clockEl.simulate('change', value, {stopPropagation: function () {}, target: {value: `${value}`}});
        return spy.lastCall.args[1];
      };

      beforeEach(() => {
        spy = sinon.spy();
      });

      it('when controlled', () => {
        tree = shallow(<Datepicker type="datetime" onChange={spy} value={date} />);
        let newDate = changeTimeAndGetNewDate(tree, 10, 'hour');
        const newTree = tree.setProps({value: newDate});
        newDate = changeTimeAndGetNewDate(newTree, 15, 'minute');
        assert.equal(+newDate, +moment(date).hour(10).minute(15));
      });

      it('when not controlled', () => {
        tree = shallow(<Datepicker type="datetime" onChange={spy} defaultValue={date} />);
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
    assert.equal(findButton(tree).prop('quiet'), true);
  });

  it('supports disabled', () => {
    const tree = shallow(<Datepicker type="datetime" disabled />);
    assert.equal(tree.prop('disabled'), true);
    assert.equal(findTextfield(tree).prop('disabled'), true);
    assert.equal(findButton(tree).prop('disabled'), true);
    assert.equal(tree.find(Calendar).prop('disabled'), true);
    assert.equal(tree.find(Clock).prop('disabled'), true);
  });

  it('supports invalid', () => {
    const tree = shallow(<Datepicker type="datetime" invalid />);
    assert.equal(tree.prop('invalid'), true);
    assert.equal(findTextfield(tree).prop('invalid'), true);
    assert.equal(findTextfield(tree).prop('aria-invalid'), true);
    assert.equal(tree.find(Calendar).prop('invalid'), true);
    assert.equal(tree.find(Clock).prop('invalid'), true);
  });

  it('supports readOnly', () => {
    const tree = shallow(<Datepicker type="datetime" readOnly />);
    assert.equal(tree.prop('aria-readonly'), true);
    assert.equal(findTextfield(tree).prop('readOnly'), true);
    assert.equal(findButton(tree).prop('disabled'), true);
    assert.equal(tree.find(Calendar).prop('readOnly'), true);
    assert.equal(tree.find(Clock).prop('readOnly'), true);
  });

  it('supports required', () => {
    const tree = shallow(<Datepicker type="datetime" required />);
    assert.equal(tree.prop('aria-required'), true);
    assert.equal(tree.find(Calendar).prop('required'), true);
    assert.equal(tree.find(Clock).prop('required'), true);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Datepicker className="myClass" />);
    assert.equal(tree.hasClass('myClass'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Datepicker foo />);
    assert.equal(findTextfield(tree).prop('foo'), true);
  });

  it('supports popover placement', () => {
    const tree = shallow(<Datepicker placement="top" />);
    assert.equal(tree.find('OverlayTrigger').prop('placement'), 'top');
  });
});

const findTextfield = tree => tree.find(Textfield);
const findButton = tree => tree.find(Button);
