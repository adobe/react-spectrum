import {cleanup, render} from '@testing-library/react';
import {ProgressCircle} from '../';
import React from 'react';
import V2ProgressCircle from '@react/react-spectrum/Wait';


describe('ProgressCircle', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name                  | Component
    ${'ProgressCircle'}   | ${ProgressCircle}
    ${'V2ProgressCircle'} | ${V2ProgressCircle}
  `('$Name handles defaults', function ({Component}) {
    let {getByRole} = render(<Component />);
    let progressCircle = getByRole('progressbar');
    expect(progressCircle).toHaveAttribute('aria-valuemin', '0');
    expect(progressCircle).toHaveAttribute('aria-valuemax', '100');
  });

  it.each`
    Name                  | Component
    ${'ProgressCircle'}   | ${ProgressCircle}
  `('$Name handles submask defaults', function ({Component}) {
    let {getByTestId} = render(<Component />);
    expect(getByTestId('fillSubMask1')).toBeDefined();
    expect(getByTestId('fillSubMask2')).toBeDefined();
    expect(getByTestId('fillSubMask1')).not.toHaveAttribute('style');
    expect(getByTestId('fillSubMask2')).not.toHaveAttribute('style');
  });

  it.each`
    Name                  | Component           | props
    ${'ProgressCircle'}   | ${ProgressCircle}   | ${{value: 25, isIndeterminate: false}}
  `('$Name shows quarter of the circle for 25%', function ({Component, props}) {
    let {getByTestId} = render(<Component {...props} />);
    expect(getByTestId('fillSubMask1')).toHaveAttribute(
      'style',
      'transform: rotate(-90deg);'
    );
    expect(getByTestId('fillSubMask2')).toHaveAttribute(
      'style',
      'transform: rotate(-180deg);'
    );
  });

  it.each`
    Name                  | Component           | props
    ${'ProgressCircle'}   | ${ProgressCircle}   | ${{value: 50, isIndeterminate: false}}
  `('$Name shows quarter of the circle for 50%', function ({Component, props}) {
    let {getByTestId} = render(<Component {...props} />);
    expect(getByTestId('fillSubMask1')).toHaveAttribute(
      'style',
      'transform: rotate(0deg);'
    );
    expect(getByTestId('fillSubMask2')).toHaveAttribute(
      'style',
      'transform: rotate(-180deg);'
    );
  });

  it.each`
    Name                  | Component           | props
    ${'ProgressCircle'}   | ${ProgressCircle}   | ${{value: 75, isIndeterminate: false}}
  `('$Name shows quarter of the circle for 75%', function ({Component, props}) {
    let {getByTestId} = render(<Component {...props} />);
    expect(getByTestId('fillSubMask1')).toHaveAttribute(
      'style',
      'transform: rotate(0deg);'
    );
    expect(getByTestId('fillSubMask2')).toHaveAttribute(
      'style',
      'transform: rotate(-90deg);'
    );
  });

  it.each`
    Name                  | Component           | props
    ${'ProgressCircle'}   | ${ProgressCircle}   | ${{value: 100, isIndeterminate: false}}
  `('$Name shows quarter of the circle for 100%', function ({Component, props}) {
    let {getByTestId} = render(<Component {...props} />);
    expect(getByTestId('fillSubMask1')).toHaveAttribute(
      'style',
      'transform: rotate(0deg);'
    );
    expect(getByTestId('fillSubMask2')).toHaveAttribute(
      'style',
      'transform: rotate(0deg);'
    );
  });

  it.each`
    Name                  | Component           | props
    ${'ProgressCircle'}   | ${ProgressCircle}   | ${{value: 60, isIndeterminate: false}}
    ${'V2ProgressCircle'} | ${V2ProgressCircle} | ${{value: 60, indeterminate: false}}
  `('$Name handles value prop', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressCircle = getByRole('progressbar');
    expect(progressCircle).toHaveAttribute('aria-valuenow', '60');
  });

  it.each`
    Name                  | Component           | props
    ${'ProgressCircle'}   | ${ProgressCircle}   | ${{isIndeterminate: true}}
    ${'V2ProgressCircle'} | ${V2ProgressCircle} | ${{indeterminate: true}}
  `('$Name supports indeterminate', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressCircle = getByRole('progressbar');
    expect(progressCircle).toHaveAttribute(
      'class',
      'spectrum-CircleLoader spectrum-CircleLoader--indeterminate'
    );
  });

  it.each`
    Name                  | Component           | props
    ${'ProgressCircle'}   | ${ProgressCircle}   | ${{isCentered: true}}
    ${'V2ProgressCircle'} | ${V2ProgressCircle} | ${{centered: true}}
  `('$Name supports centered', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressCircle = getByRole('progressbar');
    expect(progressCircle).toHaveAttribute(
      'class',
      'spectrum-CircleLoader spectrum-CircleLoader--indeterminate react-spectrum-Wait--centered'
    );
  });

  it.each`
    Name                  | Component           | props
    ${'ProgressCircle'}   | ${ProgressCircle}   | ${{size: 'L'}}
    ${'V2ProgressCircle'} | ${V2ProgressCircle} | ${{size: 'L'}}
  `('$Name supports size L', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressCircle = getByRole('progressbar');
    expect(progressCircle).toHaveAttribute(
      'class',
      'spectrum-CircleLoader spectrum-CircleLoader--indeterminate spectrum-CircleLoader--large'
    );
  });

  it.each`
    Name                  | Component           | props
    ${'ProgressCircle'}   | ${ProgressCircle}   | ${{size: 'S'}}
    ${'V2ProgressCircle'} | ${V2ProgressCircle} | ${{size: 'S'}}
  `('$Name supports size S', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressCircle = getByRole('progressbar');
    expect(progressCircle).toHaveAttribute(
      'class',
      'spectrum-CircleLoader spectrum-CircleLoader--indeterminate spectrum-CircleLoader--small'
    );
  });

  it.each`
    Name                  | Component           | props
    ${'ProgressCircle'}   | ${ProgressCircle}   | ${{className: 'testClass'}}
    ${'V2ProgressCircle'} | ${V2ProgressCircle} | ${{className: 'testClass'}}
  `('$Name supports custom class', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressCircle = getByRole('progressbar');
    expect(progressCircle).toHaveAttribute(
      'class',
      'spectrum-CircleLoader spectrum-CircleLoader--indeterminate testClass'
    );
  });
});
