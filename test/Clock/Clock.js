import React from 'react';
import moment from 'moment';
import expect, {createSpy} from 'expect';
import {shallow} from 'enzyme';
import Clock from '../../src/Clock';

describe('Clock', () => {
  it('default', () => {
    const tree = shallow(<Clock />);
    expect(tree.hasClass('coral-Clock')).toBe(true);
    expect(tree.prop('aria-disabled')).toBe(false);
    expect(tree.prop('aria-invalid')).toBe(false);
    expect(tree.prop('aria-readonly')).toBe(false);
    expect(tree.prop('aria-required')).toBe(false);

    const hour = findHourTextfield(tree);
    expect(hour.prop('invalid')).toBe(false);
    expect(hour.prop('disabled')).toBe(false);
    expect(hour.prop('readOnly')).toBe(false);
    expect(hour.prop('quiet')).toBe(false);
    expect(hour.prop('value')).toBe('');

    const minute = findMinuteTextfield(tree);
    expect(minute.prop('invalid')).toBe(false);
    expect(minute.prop('disabled')).toBe(false);
    expect(minute.prop('readOnly')).toBe(false);
    expect(minute.prop('quiet')).toBe(false);
    expect(minute.prop('value')).toBe('');
  });

  describe('dispatches onChange', () => {
    let now;
    let spy;
    let stopPropagationSpy;

    const assertChangeArgs = (element, value, compareDate, format = 'HH:mm') => {
      element.simulate('change', {stopPropagation: stopPropagationSpy, target: {value}});
      expect(stopPropagationSpy).toHaveBeenCalled();

      const args = spy.getLastCall().arguments;
      expect(args[0]).toEqual(compareDate.format(format));
      expect(+args[1]).toEqual(+compareDate);
    };

    beforeEach(() => {
      now = moment().second(0).millisecond(0);
      spy = createSpy();
      stopPropagationSpy = createSpy();
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
    expect(+tree.state('value')).toEqual(+now);

    // Component interaction should change the state.
    findHourTextfield(tree).simulate('change', {stopPropagation: function () {}, target: {value: 0}});
    expect(+tree.state('value')).toEqual(+now.clone().hours(0));
  });

  it('supports value controlled behavior', () => {
    const now = moment();
    const dateWeekLater = now.clone().add(7, 'day');

    const tree = shallow(<Clock value={ now } />);

    // Changing value will change the state.
    tree.setProps({value: dateWeekLater});
    expect(+tree.state('value')).toEqual(+dateWeekLater);

    // Component interaction should not change the state, only manually setting value
    // as a prop will change the state.
    findHourTextfield(tree).simulate('change', {stopPropagation: function () {}, target: {value: 0}});
    expect(+tree.state('value')).toEqual(+dateWeekLater);
  });

  it('supports quiet', () => {
    const tree = shallow(<Clock quiet />);
    expect(findHourTextfield(tree).prop('quiet')).toBe(true);
    expect(findMinuteTextfield(tree).prop('quiet')).toBe(true);
  });

  it('supports disabled', () => {
    const tree = shallow(<Clock disabled />);
    expect(tree.prop('aria-disabled')).toBe(true);
    expect(findHourTextfield(tree).prop('disabled')).toBe(true);
    expect(findMinuteTextfield(tree).prop('disabled')).toBe(true);
  });

  it('supports invalid', () => {
    const tree = shallow(<Clock invalid />);
    expect(tree.prop('aria-invalid')).toBe(true);
    expect(findHourTextfield(tree).prop('invalid')).toBe(true);
    expect(findMinuteTextfield(tree).prop('invalid')).toBe(true);
  });

  it('supports readOnly', () => {
    const tree = shallow(<Clock readOnly />);
    expect(tree.prop('aria-readonly')).toBe(true);
    expect(findHourTextfield(tree).prop('readOnly')).toBe(true);
    expect(findMinuteTextfield(tree).prop('readOnly')).toBe(true);
  });

  it('supports required', () => {
    const tree = shallow(<Clock required />);
    expect(tree.prop('aria-required')).toBe(true);
    expect(findHourTextfield(tree).prop('required')).toBe(true);
    expect(findMinuteTextfield(tree).prop('required')).toBe(true);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Clock className="myClass" />);
    expect(tree.hasClass('myClass')).toBe(true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Clock foo />);
    expect(tree.prop('foo')).toBe(true);
  });
});

const findHourTextfield = tree => tree.find('.coral-Clock-hour');
const findMinuteTextfield = tree => tree.find('.coral-Clock-minute');
