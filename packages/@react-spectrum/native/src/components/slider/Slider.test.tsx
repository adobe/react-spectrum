import React from 'react';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {RangeSlider, Slider} from './Slider';

describe('Slider', () => {
  it('renders with adjustable role', () => {
    let {root} = renderWithProvider(
      <Slider
        aria-label="Volume"
        defaultValue={50}
        maxValue={100}
        minValue={0}
        testID="sl"
      />
    );
    let track = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 'sl-track'
    )[0];
    expect(track.props.accessibilityRole).toBe('adjustable');
    expect(track.props.accessibilityValue.now).toBe(50);
  });

  it('shows label and value', () => {
    let {root} = renderWithProvider(
      <Slider
        defaultValue={30}
        label="Brightness"
        maxValue={100}
        minValue={0}
        showValueLabel
        testID="sl"
      />
    );
    let labelNode = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).children === 'Brightness'
    )[0];
    expect(labelNode).toBeDefined();
    let valueLabel = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).children === '30'
    )[0];
    expect(valueLabel).toBeDefined();
  });
});

describe('RangeSlider', () => {
  it('renders with adjustable role and range value', () => {
    let {root} = renderWithProvider(
      <RangeSlider
        aria-label="Price range"
        defaultValue={[20, 80]}
        maxValue={100}
        minValue={0}
        testID="rs"
      />
    );
    let track = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 'rs-track'
    )[0];
    expect(track.props.accessibilityRole).toBe('adjustable');
    expect(track.props.accessibilityValue.now).toBe(20);
  });
});
