import {cleanup} from '@testing-library/react';
import React from 'react';
import {useProgressCircle} from '../';

describe('useProgressCircle', function () {
  afterEach(cleanup);

  it('with default props if no props are provided', () => {
    let {progressProps, subMask1Style, subMask2Style} = useProgressCircle({});
    expect(progressProps.role).toBe('progressbar');
    expect(subMask1Style.transform).toBeUndefined();
    expect(subMask2Style.transform).toBeUndefined();
  });

});
