import React from 'react';
import moment from 'moment';
import assert from 'assert';
import sinon from 'sinon';
import {shallow} from 'enzyme';
import Clock from '../../src/Clock';

describe('Clock', () => {
  it('default', () => {
    const tree = shallow(<Clock />);
    assert.equal(tree.hasClass('coral-Clock'), true);
    assert.equal(tree.prop('aria-disabled'), false);
    assert.equal(tree.prop('aria-invalid'), false);
    assert.equal(tree.prop('aria-readonly'), false);
    assert.equal(tree.prop('aria-required'), false);

    const hour = findHourTextfield(tree);
    assert.equal(hour.prop('invalid'), false);
    assert.equal(hour.prop('disabled'), false);
    assert.equal(hour.prop('readOnly'), false);
    assert.equal(hour.prop('quiet'), false);
    assert.equal(hour.prop('value'), '');

    const minute = findMinuteTextfield(tree);
    assert.equal(minute.prop('invalid'), false);
    assert.equal(minute.prop('disabled'), false);
    assert.equal(minute.prop('readOnly'), false);
    assert.equal(minute.prop('quiet'), false);
    assert.equal(minute.prop('value'), '');
  });

  describe('dispatches onChange', () => {
    let now;
    let spy;
    let stopPropagationSpy;

    const assertChangeArgs = (element, value, compareDate, format = 'HH:mm') => {
      element.simulate('change', {stopPropagation: stopPropagationSpy, target: {value}});
      assert(stopPropagationSpy.called);

      const args = spy.lastCall.args;
      assert.deepEqual(args[0], compareDate.format(format));
      assert.deepEqual(+args[1], +compareDate);
    };

    beforeEach(() => {
      now = moment().second(0).millisecond(0);
      spy = sinon.spy();
      stopPropagationSpy = sinon.spy();
    });

    it('when hour changes', () => {
      const tree = shallow(<Clock onChange={ spy } value={ now } />);
      const hour = findHourTextfield(tree);
      assertChangeArgs(hour, '10', now.hour(10));
    });

    it('when minute changes', () => {
      const tree = shallow(<Clock onChange={ spy } value={ now } />);
      const minute = findMinuteTextfield(tree);
      assertChangeArgs(minute, '50', now.minute(50));
    });

    it('maintains month, day, and year of value when hour/minute changes are made', () => {
      const date = new Date(2001, 0, 1);
      const valueFormat = 'YYYY-MM-DD HH:mm';
      const tree = shallow(<Clock onChange={ spy } value={ date } valueFormat={ valueFormat } />);
      const minute = findMinuteTextfield(tree);
      assertChangeArgs(minute, '10', moment(date).minute(10), valueFormat);
    });

    it('maintains month, day, and year of defaultValue when hour/minutes changes are made', () => {
      const date = new Date(2001, 0, 1);
      const valueFormat = 'YYYY-MM-DD HH:mm';
      const tree = shallow(
        <Clock onChange={ spy } defaultValue={ date } valueFormat={ valueFormat } />
      );
      const hour = findHourTextfield(tree);
      assertChangeArgs(hour, '3', moment(date).hour(3), valueFormat);
    });
  });

  it('supports defaultValue uncontrolled behavior', () => {
    const now = moment().second(0).millisecond(0);
    const tree = shallow(<Clock defaultValue={ now } />);

    // Setting defaultValue later doesn't change the state. Only component interactions
    // change the state.
    tree.setProps({defaultValue: now.clone().add(7, 'day')});
    assert.deepEqual(+tree.state('value'), +now);

    // Component interaction should change the state.
    findHourTextfield(tree).simulate('change', {stopPropagation: function () {}, target: {value: 0}});
    assert.deepEqual(+tree.state('value'), +now.clone().hours(0));
  });

  it('supports value controlled behavior', () => {
    const now = moment();
    const dateWeekLater = now.clone().add(7, 'day');

    const tree = shallow(<Clock value={ now } />);

    // Changing value will change the state.
    tree.setProps({value: dateWeekLater});
    assert.deepEqual(+tree.state('value'), +dateWeekLater);

    // Component interaction should not change the state, only manually setting value
    // as a prop will change the state.
    findHourTextfield(tree).simulate('change', {stopPropagation: function () {}, target: {value: 0}});
    assert.deepEqual(+tree.state('value'), +dateWeekLater);
  });

  it('supports quiet', () => {
    const tree = shallow(<Clock quiet />);
    assert.equal(findHourTextfield(tree).prop('quiet'), true);
    assert.equal(findMinuteTextfield(tree).prop('quiet'), true);
  });

  it('supports disabled', () => {
    const tree = shallow(<Clock disabled />);
    assert.equal(tree.prop('aria-disabled'), true);
    assert.equal(findHourTextfield(tree).prop('disabled'), true);
    assert.equal(findMinuteTextfield(tree).prop('disabled'), true);
  });

  it('supports invalid', () => {
    const tree = shallow(<Clock invalid />);
    assert.equal(tree.prop('aria-invalid'), true);
    assert.equal(findHourTextfield(tree).prop('invalid'), true);
    assert.equal(findMinuteTextfield(tree).prop('invalid'), true);
  });

  it('supports readOnly', () => {
    const tree = shallow(<Clock readOnly />);
    assert.equal(tree.prop('aria-readonly'), true);
    assert.equal(findHourTextfield(tree).prop('readOnly'), true);
    assert.equal(findMinuteTextfield(tree).prop('readOnly'), true);
  });

  it('supports required', () => {
    const tree = shallow(<Clock required />);
    assert.equal(tree.prop('aria-required'), true);
    assert.equal(findHourTextfield(tree).prop('required'), true);
    assert.equal(findMinuteTextfield(tree).prop('required'), true);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Clock className="myClass" />);
    assert.equal(tree.hasClass('myClass'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Clock foo />);
    assert.equal(tree.prop('foo'), true);
  });
});

const findHourTextfield = tree => tree.find('.coral-Clock-hour');
const findMinuteTextfield = tree => tree.find('.coral-Clock-minute');
