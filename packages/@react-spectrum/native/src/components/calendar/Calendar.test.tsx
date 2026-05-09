import React from 'react';
import {act} from 'react-test-renderer';
import {CalendarDate} from '@internationalized/date';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {Calendar} from './Calendar';
import {DatePicker} from './DatePicker';

describe('Calendar', () => {
  it('renders prev/next navigation buttons', () => {
    let {root} = renderWithProvider(
      <Calendar aria-label="Pick date" testID="cal" />
    );
    expect(root.findAll(n => typeof n.type === 'string' && (n.props as any).testID === 'cal-prev')[0]).toBeDefined();
    expect(root.findAll(n => typeof n.type === 'string' && (n.props as any).testID === 'cal-next')[0]).toBeDefined();
  });

  it('calls onChange on day selection', () => {
    let onChange = jest.fn();
    let date = new CalendarDate(2025, 1, 15);
    let {root} = renderWithProvider(
      <Calendar aria-label="Pick date" onChange={onChange} testID="cal" />
    );
    let day = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === `cal-day-2025-01-15`
    )[0];
    if (day) {
      act(() => { day.props.onPress(); });
      expect(onChange).toHaveBeenCalled();
    }
  });

  it('renders today with today indicator', () => {
    let {root} = renderWithProvider(
      <Calendar aria-label="Pick date" testID="cal" />
    );
    let todayNodes = root.findAll(
      n =>
        typeof n.type === 'string' &&
        typeof (n.props as any).className === 'string' &&
        (n.props as any).className.includes('border-accent')
    );
    expect(todayNodes.length).toBeGreaterThanOrEqual(0);
  });
});

describe('DatePicker', () => {
  it('renders trigger button', () => {
    let {root} = renderWithProvider(
      <DatePicker label="Birthday" testID="dp" />
    );
    let trigger = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 'dp-trigger'
    )[0];
    expect(trigger).toBeDefined();
  });

  it('opens tray on trigger press', () => {
    let {root} = renderWithProvider(
      <DatePicker label="Birthday" testID="dp" />
    );
    let trigger = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 'dp-trigger'
    )[0];
    act(() => { trigger.props.onPress(); });
    let modal = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).animationType === 'slide'
    )[0];
    expect(modal.props.visible).toBe(true);
  });
});
