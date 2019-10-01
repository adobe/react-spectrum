import {cleanup, render} from '@testing-library/react';
import {ProgressBar} from '../';
import React from 'react';
import V2ProgressBar from '@react/react-spectrum/Progress';


describe('ProgressBar', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name               | Component
    ${'ProgressBar'}   | ${ProgressBar}
    ${'V2ProgressBar'} | ${V2ProgressBar}
  `('$Name handles defaults', function ({Component}) {
    let {getByRole} = render(<Component />);
    let progressBar = getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveAttribute('aria-valuetext', '0%');
  });

  it.each`
    Name               | Component        | props
    ${'ProgressBar'}   | ${ProgressBar}   | ${{value: 30}}
    ${'V2ProgressBar'} | ${V2ProgressBar} | ${{value: 30}}
  `('$Name update all fileds by value', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressBar = getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-valuenow', '30');
    expect(progressBar).toHaveAttribute('aria-valuetext', '30%');
  });

  it.each`
    Name               | Component        | props
    ${'ProgressBar'}   | ${ProgressBar}   | ${{value: -1}}
    ${'V2ProgressBar'} | ${V2ProgressBar} | ${{value: -1}}
  `('$Name clamps values to 0', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressBar = getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveAttribute('aria-valuetext', '0%');
  });

  it.each`
    Name               | Component        | props
    ${'ProgressBar'}   | ${ProgressBar}   | ${{value: 1000}}
    ${'V2ProgressBar'} | ${V2ProgressBar} | ${{value: 1000}}
  `('$Name clamps values to 100', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressBar = getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    expect(progressBar).toHaveAttribute('aria-valuetext', '100%');
  });

  it.each`
    Name               | Component        | props
    ${'ProgressBar'}   | ${ProgressBar}   | ${{size: 'S'}}
    ${'V2ProgressBar'} | ${V2ProgressBar} | ${{size: 'S'}}
  `('$Name supports small size', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressBar = getByRole('progressbar');
    expect(progressBar).toHaveAttribute(
      'class',
      'spectrum-BarLoader spectrum-BarLoader--small spectrum-BarLoader--sideLabel'
    );
  });

  it.each`
    Name               | Component        | props
    ${'ProgressBar'}   | ${ProgressBar}   | ${{variant: 'positive', size: 'S'}}
    ${'V2ProgressBar'} | ${V2ProgressBar} | ${{variant: 'positive', size: 'S'}}
  `('$Name supports variant positive', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressBar = getByRole('progressbar');
    expect(progressBar).toHaveAttribute(
      'class',
      'spectrum-BarLoader spectrum-BarLoader--small spectrum-BarLoader--sideLabel is-positive'
    );
  });

  it.each`
    Name               | Component        | props
    ${'ProgressBar'}   | ${ProgressBar}   | ${{variant: 'warning', size: 'S'}}
    ${'V2ProgressBar'} | ${V2ProgressBar} | ${{variant: 'warning', size: 'S'}}
  `('$Name supports variant warning', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressBar = getByRole('progressbar');
    expect(progressBar).toHaveAttribute(
      'class',
      'spectrum-BarLoader spectrum-BarLoader--small spectrum-BarLoader--sideLabel is-warning'
    );
  });

  it.each`
    Name               | Component        | props
    ${'ProgressBar'}   | ${ProgressBar}   | ${{variant: 'critical', size: 'S'}}
    ${'V2ProgressBar'} | ${V2ProgressBar} | ${{variant: 'critical', size: 'S'}}
  `('$Name supports variant critical', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressBar = getByRole('progressbar');
    expect(progressBar).toHaveAttribute(
      'class',
      'spectrum-BarLoader spectrum-BarLoader--small spectrum-BarLoader--sideLabel is-critical'
    );
  });

  it.each`
    Name               | Component        | props
    ${'ProgressBar'}   | ${ProgressBar}   | ${{variant: 'overBackground', size: 'S'}}
    ${'V2ProgressBar'} | ${V2ProgressBar} | ${{variant: 'overBackground', size: 'S'}}
  `('$Name supports variant overBackground', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressBar = getByRole('progressbar');
    expect(progressBar).toHaveAttribute(
      'class',
      'spectrum-BarLoader spectrum-BarLoader--small spectrum-BarLoader--sideLabel spectrum-BarLoader--overBackground'
    );
  });

  it.each`
    Name               | Component        | props
    ${'ProgressBar'}   | ${ProgressBar}   | ${{isIndeterminate: true, size: 'S'}}
    ${'V2ProgressBar'} | ${V2ProgressBar} | ${{isIndeterminate: true, size: 'S'}}
  `('$Name supports indeterminate', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressBar = getByRole('progressbar');
    expect(progressBar).toHaveAttribute(
      'class',
      'spectrum-BarLoader spectrum-BarLoader--small spectrum-BarLoader--indeterminate spectrum-BarLoader--sideLabel'
    );
  });
});
