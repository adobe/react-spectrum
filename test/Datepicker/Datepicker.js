import assert from 'assert';
import Button from '../../src/Button';
import Calendar from '../../src/Calendar';
import CalendarIcon from '../../src/Icon/Calendar';
import Clock from '../../src/Clock';
import ClockIcon from '../../src/Icon/Clock';
import Datepicker from '../../src/Datepicker';
import moment from 'moment';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import Textfield from '../../src/Textfield';

const DEFAULT_DATE_VAL_FORMAT = 'YYYY-MM-DD';
const DEFAULT_TIME_VAL_FORMAT = 'HH:mm';
const DEFAULT_DATE_TIME_VAL_FORMAT = `${DEFAULT_DATE_VAL_FORMAT} ${DEFAULT_TIME_VAL_FORMAT}`;
const POPOVER_SELECTOR = '.spectrum-Popover';
const PREV_MONTH_BUTTON_SELECTOR = '.spectrum-Calendar-prevMonth';
const HOUR_TEXTFIELD_SELECTOR = '.react-spectrum-Clock-hour';
const MINUTE_TEXTFIELD_SELECTOR = '.react-spectrum-Clock-minute';
const CLOSE_BUTTON_SELECTOR = '.react-spectrum-Datepicker-closeButton';

describe('Datepicker', () => {
  let clock;
  let tree;
  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });
  afterEach(async () => {
    document.activeElement.blur();
    clock.tick(125);
    if (tree) {
      tree.unmount();
      tree = null;
    }
    clock.restore();
  });
  it('default', () => {
    const tree = shallow(<Datepicker type="datetime" />);
    assert.equal(tree.hasClass('spectrum-Datepicker'), true);
    assert.equal(tree.hasClass('is-invalid'), false);

    const textfield = findTextfield(tree);
    assert.equal(textfield.hasClass('spectrum-InputGroup-field'), true);
    assert(!textfield.prop('aria-invalid'));
    assert.equal(textfield.prop('readOnly'), false);
    assert.equal(textfield.prop('disabled'), false);
    assert.equal(textfield.prop('invalid'), false);
    assert.equal(textfield.prop('quiet'), false);

    const button = findToggleButton(tree);
    assert.equal(button.prop('variant'), 'field');
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
    assert.equal(findToggleButton(tree).prop('icon').type, CalendarIcon);
    assert.equal(tree.instance().getDefaultValueFormat(tree.instance().props), 'YYYY-MM-DD');

    tree.setProps({type: 'datetime'});
    assert.equal(tree.find(Calendar).length, 1);
    assert.equal(tree.find(Clock).length, 1);
    assert.equal(findToggleButton(tree).prop('icon').type, CalendarIcon);
    assert.equal(tree.instance().getDefaultValueFormat(tree.instance().props), 'YYYY-MM-DD HH:mm');

    tree.setProps({type: 'time'});
    assert.equal(tree.find(Calendar).length, 0);
    assert.equal(tree.find(Clock).length, 1);
    assert.equal(findToggleButton(tree).prop('icon').type, ClockIcon);
    assert.equal(tree.instance().getDefaultValueFormat(tree.instance().props), 'HH:mm');

    tree.setProps({type: 'foo'});
    assert.throws(() => tree.instance().getDefaultValueFormat(tree.instance().props), 'Error: foo is not a valid type. Must be \'date\', \'datetime\', or \'time\'');

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

  describe('onFocus', () => {
    it('focusing textfield', () => {
      const spy = sinon.spy();
      const event = {};
      const tree = shallow(<Datepicker />);

      findTextfield(tree).simulate('focus', event);
      assert(!spy.called);
      assert(tree.state('focused'));

      tree.setState({focused: false});
      tree.setProps({onFocus: spy});

      findTextfield(tree).simulate('focus', event);
      assert(spy.calledWith(event));
      assert(tree.state('focused'));
    });
  });

  describe('onBlur', () => {
    it('calls onBlur when text input is blurred', () => {
      const spy = sinon.spy();
      const event = {target: {value: '2016-08-01 00:00'}};
      const tree = shallow(<Datepicker />);
      findTextfield(tree).simulate('blur', event);
      assert(!spy.called);
      assert(!tree.state('focused'));

      tree.setState({focused: true});
      tree.setProps({onBlur: spy});
      findTextfield(tree).simulate('blur', event);
      assert(spy.calledWith(event));
    });

    it('calls onBlur when text input is blurred - range', () => {
      const spy = sinon.spy();
      const event = {target: {value: '2016-08-01', name: 'start'}};
      const tree = shallow(<Datepicker onBlur={spy} selectionType="range" />);

      findTextfield(tree).at(0).simulate('blur', event);
      assert(spy.calledWith(event));
    });

    it('calls onBlur when text input is blurred - range start date higher then end date', () => {
      const spy = sinon.spy();
      const event = {target: {value: '2016-08-01', name: 'start'}};
      const tree = shallow(<Datepicker onBlur={spy} selectionType="range" />);
      tree.setState({valueText: {start: '', end: '2016-07-01'}});

      findTextfield(tree).at(0).simulate('blur', event);
      assert(spy.calledWith(event));
      assert.deepEqual(tree.state('invalid'), true);
    });

    it('calls onBlur when text input is blurred - range end date lower then start date', () => {
      const spy = sinon.spy();
      const event = {target: {value: '2016-06-01', name: 'end'}};
      const tree = shallow(<Datepicker onBlur={spy} selectionType="range" />);
      tree.setState({valueText: {start: '2016-07-01', end: ''}});

      findTextfield(tree).at(1).simulate('blur', event);
      assert(spy.calledWith(event));
      assert.deepEqual(tree.state('invalid'), true);
    });

    it('calls onBlur when text input is blurred - range date not valid', () => {
      const spy = sinon.spy();
      const event = {target: {value: 'NOT VALID', name: 'start'}};
      const tree = shallow(<Datepicker onBlur={spy} selectionType="range" />);
      tree.setState({valueText: {start: '', end: '2016-07-01'}});

      findTextfield(tree).at(0).simulate('blur', event);
      assert(spy.calledWith(event));
      assert.deepEqual(tree.state('invalid'), true);
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
    assert.equal(findToggleButton(tree).prop('quiet'), true);
  });

  it('supports disabled', () => {
    const tree = shallow(<Datepicker type="datetime" disabled />);
    assert.equal(tree.prop('disabled'), true);
    assert.equal(findTextfield(tree).prop('disabled'), true);
    assert.equal(findToggleButton(tree).prop('disabled'), true);
    assert.equal(tree.find(Calendar).prop('disabled'), true);
    assert.equal(tree.find(Clock).prop('disabled'), true);
  });

  it('supports invalid', () => {
    const tree = shallow(<Datepicker type="datetime" invalid />);
    assert.equal(tree.prop('invalid'), true);
    assert.equal(findTextfield(tree).prop('invalid'), true);
    assert.equal(tree.find(Calendar).prop('invalid'), true);
    assert.equal(tree.find(Clock).prop('invalid'), true);
  });

  it('supports readOnly', () => {
    const tree = shallow(<Datepicker type="datetime" readOnly />);
    assert.equal(findTextfield(tree).prop('readOnly'), true);
    assert.equal(findToggleButton(tree).prop('disabled'), true);
    assert.equal(tree.find(Calendar).prop('readOnly'), true);
    assert.equal(tree.find(Clock).prop('readOnly'), true);
  });

  it('supports required', () => {
    const tree = shallow(<Datepicker type="datetime" required />);
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

  it('supports range', () => {
    const tree = shallow(<Datepicker selectionType="range" />);
    const textfield = findTextfield(tree);
    assert.equal(textfield.length, 2);
    assert.equal(textfield.at(0).prop('name'), 'start');
    assert(textfield.at(0).hasClass(`spectrum-Datepicker-${textfield.at(0).prop('name')}Field`));
    assert.equal(textfield.at(1).prop('name'), 'end');
    assert(textfield.at(1).hasClass(`spectrum-Datepicker-${textfield.at(1).prop('name')}Field`));
  });

  describe('range with type="time"', () => {
    it('calls onChange with new start and end times when clock updates', () => {
      const spy = sinon.spy();
      const tree = shallow(<Datepicker selectionType="range" type="time" onChange={spy} />);

      const clock = tree.find(Clock);
      assert.equal(clock.length, 2);
      assert.equal(clock.at(0).prop('name'), 'startTime');
      assert.equal(clock.at(1).prop('name'), 'endTime');

      // call change event for startTime
      let newValue = moment('01:30', DEFAULT_TIME_VAL_FORMAT);
      clock.at(0).simulate('change', 'start', newValue.format(DEFAULT_TIME_VAL_FORMAT), newValue);
      assert.equal(spy.lastCall.args[0].start, newValue.format(DEFAULT_TIME_VAL_FORMAT));

      // call change event for endTime
      newValue = moment('20:30', DEFAULT_TIME_VAL_FORMAT);
      clock.at(1).simulate('change', 'end', newValue.format(DEFAULT_TIME_VAL_FORMAT), newValue);
      assert.equal(spy.lastCall.args[0].end, newValue.format(DEFAULT_TIME_VAL_FORMAT));
    });
  });
  describe('range with type="datetime"', () => {
    it('calls onChange with new time when clock updates', () => {
      const spy = sinon.spy();
      const tree = shallow(<Datepicker selectionType="range" type="datetime" value={['2016-08-01 01:30', '2016-08-07 20:30']} onChange={spy} />);
      const clock = tree.find(Clock);
      assert.equal(clock.length, 2);
      assert.equal(clock.at(0).prop('name'), 'startTime');
      assert.equal(clock.at(1).prop('name'), 'endTime');
      assert.equal(clock.at(0).prop('value').format(DEFAULT_TIME_VAL_FORMAT), '01:30');
      assert.equal(clock.at(1).prop('value').format(DEFAULT_TIME_VAL_FORMAT), '20:30');

      // call change event for startTime
      let newValue = clock.at(0).prop('value').clone().minutes(45);
      clock.at(0).simulate('change', 'start', newValue.format(DEFAULT_DATE_TIME_VAL_FORMAT), newValue);
      assert.equal(spy.lastCall.args[0].start, newValue.format(DEFAULT_DATE_TIME_VAL_FORMAT));

      // call change event for endTime
      newValue = clock.at(1).prop('value').clone().minutes(45);
      clock.at(1).simulate('change', 'end', newValue.format(DEFAULT_DATE_TIME_VAL_FORMAT), newValue);
      assert.equal(spy.lastCall.args[0].end, newValue.format(DEFAULT_DATE_TIME_VAL_FORMAT));
    });

    it('calls onChange with correct start and end times when calendar updates', () => {
      const spy = sinon.spy();
      tree = mount(<Datepicker selectionType="range" type="datetime" value={['2016-08-01 01:30', '2016-08-07 20:30']} onChange={spy} />);
      const instance = tree.instance();
      findToggleButton(tree).simulate('focus');
      findToggleButton(tree).simulate('click');
      let newValue = instance.calendarRef.props.value.clone();
      newValue.start = newValue.start.clone().add(1, 'd');
      newValue.end = newValue.end.clone().subtract(1, 'd');
      instance.calendarRef.setValue(newValue);
      assert.equal(spy.lastCall.args[0].start, newValue.start.format(DEFAULT_DATE_TIME_VAL_FORMAT));
      assert.equal(spy.lastCall.args[0].end, newValue.end.format(DEFAULT_DATE_TIME_VAL_FORMAT));
    });

    it('should reverse order if end time is before start time', () => {
      const spy = sinon.spy();
      tree = mount(<Datepicker selectionType="range" type="datetime" value={['2016-08-01 01:30', '2016-08-01 02:30']} onChange={spy} />);
      const instance = tree.instance();
      findToggleButton(tree).simulate('focus');
      findToggleButton(tree).simulate('click');
      let newValue = instance.calendarRef.props.value.clone();
      newValue.end = newValue.end.clone().subtract(2, 'd');
      instance.calendarRef.setValue(newValue);
      assert.equal(spy.lastCall.args[0].start, newValue.end.format(DEFAULT_DATE_TIME_VAL_FORMAT));
      assert.equal(spy.lastCall.args[0].end, newValue.start.format(DEFAULT_DATE_TIME_VAL_FORMAT));
    });
  });

  it('calls onChange with correct time when calendar updates', () => {
    const val = moment('2016-08-01 01:30');
    const spy = sinon.spy();
    tree = mount(<Datepicker selectionType="single" type="datetime" value={val} onChange={spy} />);
    const instance = tree.instance();
    findToggleButton(tree).simulate('focus');
    findToggleButton(tree).simulate('click');
    tree.setProps({selectionType: 'single'});
    let newValue = instance.calendarRef.props.value.clone().add(1, 'd');
    instance.calendarRef.setValue(newValue);
    assert.equal(spy.lastCall.args[0], newValue.format(DEFAULT_DATE_TIME_VAL_FORMAT));
  });

  describe('Accessibility', () => {
    describe('labelling', () => {
      describe('selectionType="single"', () => {
        it('with aria-label', () => {
          tree = mount(<Datepicker aria-label="Datepicker" />);
          const textfield = findTextfield(tree);
          assert.equal(textfield.length, 1);
          assert.equal(textfield.prop('aria-label'), 'Datepicker');
        });

        it('with aria-labelledby', () => {
          const ariaLabelledby = 'foo-id';
          tree = mount(<Datepicker aria-labelledby={ariaLabelledby} />);
          const textfield = findTextfield(tree);
          assert.equal(textfield.length, 1);
          assert.equal(textfield.prop('aria-labelledby'), ariaLabelledby);
        });
      });

      describe('selectionType="range"', () => {
        it('with aria-label', () => {
          tree = mount(<Datepicker selectionType="range" aria-label="Datepicker" />);
          const id = tree.instance().datepickerId;
          const textfield = findTextfield(tree);
          assert.equal(textfield.length, 2);
          assert.equal(textfield.at(0).prop('aria-label'), 'Start Date');
          assert.equal(textfield.at(1).prop('aria-label'), 'End Date');
          assert.equal(tree.find('InputGroup').prop('id'), `${id}-combobox`);
          assert.equal(textfield.at(0).prop('id'), id);
          assert.equal(textfield.at(1).prop('id'), `${id}-end`);
          assert.equal(textfield.at(0).prop('aria-labelledby'), `${id}-combobox ${id}`);
          assert.equal(textfield.at(1).prop('aria-labelledby'), `${id}-combobox ${id}-end`);
        });

        it('with aria-labelledby', () => {
          const ariaLabelledby = 'foo-id';
          tree = mount(<Datepicker selectionType="range" aria-labelledby={ariaLabelledby} />);
          const id = tree.instance().datepickerId;
          const textfield = findTextfield(tree);
          assert.equal(textfield.length, 2);
          assert.equal(textfield.at(0).prop('aria-label'), 'Start Date');
          assert.equal(textfield.at(1).prop('aria-label'), 'End Date');
          assert.equal(tree.find('InputGroup').prop('id'), `${id}-combobox`);
          assert.equal(textfield.at(0).prop('id'), id);
          assert.equal(textfield.at(1).prop('id'), `${id}-end`);
          assert.equal(textfield.at(0).prop('aria-labelledby'), `${ariaLabelledby} ${id}`);
          assert.equal(textfield.at(1).prop('aria-labelledby'), `${ariaLabelledby} ${id}-end`);
        });
      });
    });
  });

  it('supports expanding popover using the down arrow', () => {
    const spy = sinon.spy();
    const showSpy = sinon.spy();
    const event = {key: 'ArrowDown', defaultPrevented: false};
    const tree = shallow(<Datepicker />);
    tree.instance().overlayTriggerRef = {show: showSpy};
    findTextfield(tree).simulate('keydown', event);
    assert(!spy.called);
    assert(showSpy.calledWith(event));

    showSpy.reset();
    tree.setProps({onKeyDown: spy});
    findTextfield(tree).simulate('keydown', event);
    assert(spy.calledWith(event));
    assert(showSpy.calledWith(event));

    spy.reset();
    showSpy.reset();
    event.key = 'Down';
    findTextfield(tree).simulate('keydown', event);
    assert(spy.calledWith(event));
    assert(showSpy.calledWith(event));

    spy.reset();
    showSpy.reset();
    event.key = 'ArrowUp';
    findTextfield(tree).simulate('keydown', event);
    assert(spy.calledWith(event));
    assert(!showSpy.called);

    spy.reset();
    showSpy.reset();
    event.key = 'ArrowDown';
    findToggleButton(tree).simulate('keydown', event);
    assert(spy.calledWith(event));
    assert(showSpy.calledWith(event));

    spy.reset();
    showSpy.reset();
    event.defaultPrevented = true;
    findTextfield(tree).simulate('keydown', event);
    assert(spy.calledWith(event));
    assert(!showSpy.called);
  });

  it('clicking overlay trigger button toggles open state', async () => {
    tree = mount(<Datepicker />);
    const instance = tree.instance();
    assert(!tree.state('open'));
    findToggleButton(tree).getDOMNode().focus();
    findToggleButton(tree).simulate('focus');
    findToggleButton(tree).simulate('click');
    clock.tick(125);
    assert(tree.state('open'));
    assert.equal(document.activeElement, instance.calendarRef.calendarBody);
    findToggleButton(tree).simulate('focus');
    findToggleButton(tree).simulate('click');
    clock.tick(125);
    assert(!tree.state('open'));

    // textfield should receive focus on close
    assert.equal(document.activeElement, findToggleButton(tree).getDOMNode());
  });

  describe('focus management', () => {
    let clock;
    let tree;
    let instance;
    beforeEach(() => {
      clock = sinon.useFakeTimers();
      tree = mount(<Datepicker />);
      instance = tree.instance();
    });
    afterEach(async () => {
      document.activeElement.blur();
      clock.tick(125);
      if (tree) {
        tree.unmount();
        tree = null;
      }
      clock.restore();
    });

    it('when type=date/datetime, should focus previous month button when Popover dialog element receives focus', async () => {
      assert(!tree.state('open'));
      findToggleButton(tree).simulate('click');
      clock.tick(125);
      assert(tree.state('open'));
      assert.equal(document.activeElement, instance.calendarRef.calendarBody);
      // trapFocus should manage focus among descendants, so blur before testing trapFocus on Popover itself
      document.activeElement.blur();
      document.querySelector(POPOVER_SELECTOR).focus();
      assert.equal(document.activeElement, document.querySelector(PREV_MONTH_BUTTON_SELECTOR));
      findToggleButton(tree).simulate('focus');
      findToggleButton(tree).simulate('click');
      clock.tick(125);
      assert(!tree.state('open'));
    });

    it('when type=time, should focus hours input when Popover dialog element receives focus', async () => {
      // Clock type
      tree.setProps({type: 'time'});
      findToggleButton(tree).simulate('click');
      clock.tick(125);
      assert(tree.state('open'));
      assert.equal(document.activeElement, document.querySelector(HOUR_TEXTFIELD_SELECTOR));
      // trapFocus should manage focus among descendants, so blur before testing trapFocus on Popover itself
      document.activeElement.blur();
      document.querySelector(POPOVER_SELECTOR).focus();
      assert.equal(document.activeElement, document.querySelector(HOUR_TEXTFIELD_SELECTOR));
      findToggleButton(tree).simulate('focus');
      findToggleButton(tree).simulate('click');
      clock.tick(125);
      assert(!tree.state('open'));
    });

    it('close button closes popover and restores focus to last focus', async () => {
      tree.setProps({type: 'date'});

      // when opening from toggle button
      findToggleButton(tree).getDOMNode().focus();
      findToggleButton(tree).simulate('focus');
      findToggleButton(tree).simulate('click');
      clock.tick(125);
      assert(tree.state('open'));
      document.querySelector(CLOSE_BUTTON_SELECTOR).focus();
      document.querySelector(CLOSE_BUTTON_SELECTOR).click();
      clock.tick(125);
      assert(!tree.state('open'));

      // toggle button should receive focus on close
      assert.equal(document.activeElement, findToggleButton(tree).getDOMNode());

      // when opening from textfield
      findTextfield(tree).getDOMNode().focus();
      findTextfield(tree).simulate('keydown', {key: 'ArrowDown', defaultPrevented: false});
      clock.tick(125);
      assert(tree.state('open'));
      document.querySelector(CLOSE_BUTTON_SELECTOR).focus();
      document.querySelector(CLOSE_BUTTON_SELECTOR).click();
      clock.tick(125);
      assert(!tree.state('open'));

      // textfield should receive focus on close
      assert.equal(document.activeElement, findTextfield(tree).getDOMNode());
    });

    it('should wrap focus within popover', async () => {
      findTextfield(tree).simulate('focus');
      findToggleButton(tree).simulate('click');
      clock.tick(125);
      assert(tree.state('open'));
      const preventDefault = sinon.spy();
      const stopPropagation = sinon.spy();
      const event = {
        type: 'keydown',
        key: 'Tab',
        shiftKey: false,
        target: instance.calendarRef.calendarBody,
        preventDefault,
        stopPropagation,
        isPropagationStopped: () => false
      };
      instance.popoverRef.onKeyDown(event);
      assert(preventDefault.called);
      assert(stopPropagation.called);
      assert.equal(document.activeElement, document.querySelector(PREV_MONTH_BUTTON_SELECTOR));
      document.activeElement.blur();

      tree.setProps({type: 'datetime'});
      event.target = document.querySelector(MINUTE_TEXTFIELD_SELECTOR);
      instance.popoverRef.onKeyDown(event);
      assert(preventDefault.calledTwice);
      assert(stopPropagation.calledTwice);
      assert.equal(document.activeElement, document.querySelector(PREV_MONTH_BUTTON_SELECTOR));
      document.activeElement.blur();

      tree.setProps({type: 'time'});
      event.target = document.querySelector(MINUTE_TEXTFIELD_SELECTOR);
      instance.popoverRef.onKeyDown(event);
      assert(preventDefault.calledThrice);
      assert(stopPropagation.calledThrice);
      assert.equal(document.activeElement, document.querySelector(HOUR_TEXTFIELD_SELECTOR));

      // shiftKey=true
      event.target = document.querySelector(HOUR_TEXTFIELD_SELECTOR);
      event.shiftKey = true;
      instance.popoverRef.onKeyDown(event);
      assert.equal(preventDefault.callCount, 4);
      assert.equal(stopPropagation.callCount, 4);
      assert.equal(document.activeElement, document.querySelector(MINUTE_TEXTFIELD_SELECTOR));

      tree.setProps({type: 'datetime'});
      event.target = document.querySelector(PREV_MONTH_BUTTON_SELECTOR);
      instance.popoverRef.onKeyDown(event);
      assert.equal(preventDefault.callCount, 5);
      assert.equal(stopPropagation.callCount, 5);
      assert.equal(document.activeElement, document.querySelector(MINUTE_TEXTFIELD_SELECTOR));

      tree.setProps({type: 'date'});
      event.target = document.querySelector(PREV_MONTH_BUTTON_SELECTOR);
      instance.popoverRef.onKeyDown(event);
      assert.equal(preventDefault.callCount, 6);
      assert.equal(stopPropagation.callCount, 6);
      assert.equal(document.activeElement, instance.calendarRef.calendarBody);

      const date = moment('2016-08-01', DEFAULT_DATE_VAL_FORMAT);
      instance.handleCalendarChange(date);
      clock.tick(125);
      assert(!tree.state('open'));
    });

    it('Enter key should close popover', async () => {
      tree.setProps({type: 'datetime'});
      findToggleButton(tree).simulate('click');
      clock.tick(125);
      assert(tree.state('open'));
      const preventDefault = sinon.spy();
      const stopPropagation = sinon.spy();
      const event = {
        type: 'keydown',
        key: 'Enter',
        target: document.querySelector(HOUR_TEXTFIELD_SELECTOR),
        preventDefault,
        stopPropagation,
        isPropagationStopped: () => true
      };
      instance.popoverRef.onKeyDown(event);
      assert(stopPropagation.called);
      clock.tick(125);
      assert(!tree.state('open'));
    });
  });
});

const findTextfield = tree => tree.find(Textfield);
const findToggleButton = tree => tree.find(Button).first();
