import {ProgressCircle} from '../';
import {cleanup, render} from '@testing-library/react';
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
});
