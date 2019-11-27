import {cleanup, render} from '@testing-library/react';
import {ProgressCircle} from '../';
import React from 'react';
import V2ProgressCircle from '@react/react-spectrum/Wait';


describe('ProgressCircle', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name                  | Component           | props
    ${'ProgressCircle'}   | ${ProgressCircle}   | ${{}}
    ${'V2ProgressCircle'} | ${V2ProgressCircle} | ${{indeterminate: false}}
  `('$Name handles defaults', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressCircle = getByRole('progressbar');
    expect(progressCircle).toHaveAttribute('aria-valuemin', '0');
    expect(progressCircle).toHaveAttribute('aria-valuemax', '100');
    expect(progressCircle).toHaveAttribute('aria-valuenow', '0');
  });

  it.each`
    Name                  | Component           | props
    ${'ProgressCircle'}   | ${ProgressCircle}   | ${{isIndeterminate: true}}
    ${'V2ProgressCircle'} | ${V2ProgressCircle} | ${{}}
  `('$Name handles indeterminate', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressCircle = getByRole('progressbar');
    expect(progressCircle).toHaveAttribute('aria-valuemin', '0');
    expect(progressCircle).toHaveAttribute('aria-valuemax', '100');
    expect(progressCircle).not.toHaveAttribute('aria-valuenow');
  });

  it.each`
    Name                  | Component           | props
    ${'ProgressCircle'}   | ${ProgressCircle}   | ${{value: 30}}
    ${'V2ProgressCircle'} | ${V2ProgressCircle} | ${{value: 30, indeterminate: false}}
  `('$Name handles defaults', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressCircle = getByRole('progressbar');
    expect(progressCircle).toHaveAttribute('aria-valuemin', '0');
    expect(progressCircle).toHaveAttribute('aria-valuemax', '100');
    expect(progressCircle).toHaveAttribute('aria-valuenow', '30');
  });

  it.each`
    Name               | Component        | props
    ${'ProgressCircle'}   | ${ProgressCircle}   | ${{value: -1}}
    ${'V2ProgressCircle'} | ${V2ProgressCircle} | ${{value: -1, indeterminate: false}}
  `('$Name clamps values to 0', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressCircle = getByRole('progressbar');
    expect(progressCircle).toHaveAttribute('aria-valuenow', '0');
  });

  it.each`
    Name               | Component        | props
    ${'ProgressCircle'}   | ${ProgressCircle}   | ${{value: 1000}}
    ${'V2ProgressCircle'} | ${V2ProgressCircle} | ${{value: 1000, indeterminate: false}}
  `('$Name clamps values to 100', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressCircle = getByRole('progressbar');
    expect(progressCircle).toHaveAttribute('aria-valuenow', '100');
  });

  it.each`
    Name                  | Component           | props
    ${'ProgressCircle'}   | ${ProgressCircle}   | ${{UNSAFE_className: 'testClass'}}
    ${'V2ProgressCircle'} | ${V2ProgressCircle} | ${{className: 'testClass'}}
  `('$Name supports UNSAFE_className', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressCircle = getByRole('progressbar');
    expect(progressCircle).toHaveAttribute('class', expect.stringContaining('testClass'));
  });

  // These tests only work against v3 for data-testid
  it('handles submask defaults', () => {
    let {getByRole, getByTestId} = render(<ProgressCircle value={0} />);
    let progressCircle = getByRole('progressbar');
    expect(progressCircle).toHaveAttribute('aria-valuenow', '0');
    expect(progressCircle).toHaveAttribute('aria-valuetext', '0%');
    expect(getByTestId('fillSubMask1')).toBeDefined();
    expect(getByTestId('fillSubMask2')).toBeDefined();
    expect(getByTestId('fillSubMask1')).not.toHaveAttribute('style');
    expect(getByTestId('fillSubMask2')).not.toHaveAttribute('style');
  });

  it('shows none of the circle for 0%', () => {
    let {getByTestId} = render(<ProgressCircle value={0} />);
    expect(getByTestId('fillSubMask1')).not.toHaveAttribute('style');
    expect(getByTestId('fillSubMask2')).not.toHaveAttribute('style');
  });

  it('shows quarter of the circle for 25%', () => {
    let {getByTestId} = render(<ProgressCircle value={25} />);
    expect(getByTestId('fillSubMask1')).toHaveAttribute(
      'style',
      'transform: rotate(-90deg);'
    );
    expect(getByTestId('fillSubMask2')).toHaveAttribute(
      'style',
      'transform: rotate(-180deg);'
    );
  });

  it('shows half the circle for 50%', () => {
    let {getByTestId} = render(<ProgressCircle value={50} />);
    expect(getByTestId('fillSubMask1')).toHaveAttribute(
      'style',
      'transform: rotate(0deg);'
    );
    expect(getByTestId('fillSubMask2')).toHaveAttribute(
      'style',
      'transform: rotate(-180deg);'
    );
  });

  it('shows quarter of the circle for 75%', () => {
    let {getByTestId} = render(<ProgressCircle value={75} />);
    expect(getByTestId('fillSubMask1')).toHaveAttribute(
      'style',
      'transform: rotate(0deg);'
    );
    expect(getByTestId('fillSubMask2')).toHaveAttribute(
      'style',
      'transform: rotate(-90deg);'
    );
  });

  it('shows all of the circle for 100%', () => {
    let {getByTestId} = render(<ProgressCircle value={100} />);
    expect(getByTestId('fillSubMask1')).toHaveAttribute(
      'style',
      'transform: rotate(0deg);'
    );
    expect(getByTestId('fillSubMask2')).toHaveAttribute(
      'style',
      'transform: rotate(0deg);'
    );
  });
});
