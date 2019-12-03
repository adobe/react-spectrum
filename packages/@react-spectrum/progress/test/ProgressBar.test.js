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
    ${'ProgressBar'}   | ${ProgressBar}   | ${{size: 'S', className: 'testClass'}}
    ${'V2ProgressBar'} | ${V2ProgressBar} | ${{size: 'S', className: 'testClass'}}
  `('$Name supports custom class', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);
    let progressBar = getByRole('progressbar');
    expect(progressBar).toHaveAttribute('class', expect.stringContaining('testClass'));
  });

  it('Can handle negative values', () => {
    let {getByRole} = render(<ProgressBar value={0} min={-5} max={5} />);
    let progressBar = getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveAttribute('aria-valuetext', '50%');
  });

});
