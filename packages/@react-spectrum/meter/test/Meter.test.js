import {cleanup, render} from '@testing-library/react';
import {Meter} from '../';
import React from 'react';

describe('Meter', function () {
  afterEach(() => {
    cleanup();
  });

  it('handles defaults', function () {
    let {getByRole} = render(<Meter>Meter</Meter>);
    let progressBar = getByRole('meter progressbar');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveAttribute('aria-valuetext', '0%');
  });

  it('updates all fields by value', function () {
    let {getByRole} = render(<Meter value={30}>Meter</Meter>);
    let progressBar = getByRole('meter progressbar');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-valuenow', '30');
    expect(progressBar).toHaveAttribute('aria-valuetext', '30%');
  });

  it('clamps values to 0', function () {
    let {getByRole} = render(<Meter value={-1}>Meter</Meter>);
    let progressBar = getByRole('meter progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveAttribute('aria-valuetext', '0%');
  });

  it('clamps values to 100', function () {
    let {getByRole} = render(<Meter value={1000}>Meter</Meter>);
    let progressBar = getByRole('meter progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    expect(progressBar).toHaveAttribute('aria-valuetext', '100%');
  });

  it('supports UNSAFE_className', function () {
    let {getByRole} = render(<Meter size="S" UNSAFE_className="testClass">Meter</Meter>);
    let progressBar = getByRole('meter progressbar');
    expect(progressBar).toHaveAttribute('class', expect.stringContaining('testClass'));
  });

  it('can handle negative values', function () {
    let {getByRole} = render(<Meter value={0} minValue={-5} maxValue={5}>Meter</Meter>);
    let progressBar = getByRole('meter progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveAttribute('aria-valuetext', '50%');
  });
});
