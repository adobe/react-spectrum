import {cleanup} from '@testing-library/react';
import React from 'react';
import {useProgressCircle} from '../';

describe('useProgressCircle', function () {
  afterEach(cleanup);

  it('with default props if no props are provided', () => {
    let {progressProps, subMask1Style, subMask2Style} = useProgressCircle({});
    expect(progressProps.role).toBe('progressbar');
    expect(progressProps['aria-valuenow']).toBeUndefined();
    expect(progressProps['aria-valuemin']).toBe(0);
    expect(progressProps['aria-valuemax']).toBe(100);
    expect(subMask1Style.transform).toBeUndefined();
    expect(subMask2Style.transform).toBeUndefined();
  });

  it('with none of the circle props for 0%', () => {
    let {progressProps, subMask1Style, subMask2Style} = useProgressCircle({value: 0, isIndeterminate: false});
    expect(progressProps['aria-valuenow']).toBe(0);
    expect(subMask1Style.transform).toBeUndefined();
    expect(subMask2Style.transform).toBeUndefined();
  });

  it('with quarter of the circle props for 25%', () => {
    let {progressProps, subMask1Style, subMask2Style} = useProgressCircle({value: 25, isIndeterminate: false});
    expect(progressProps['aria-valuenow']).toBe(25);
    expect(subMask1Style.transform).toBe('rotate(-90deg)');
    expect(subMask2Style.transform).toBe('rotate(-180deg)');
  });

  it('with half the circle props for 50%', () => {
    let {progressProps, subMask1Style, subMask2Style} = useProgressCircle({value: 50, isIndeterminate: false});
    expect(progressProps['aria-valuenow']).toBe(50);
    expect(subMask1Style.transform).toBe('rotate(0deg)');
    expect(subMask2Style.transform).toBe('rotate(-180deg)');
  });

  it('with quarter of the circle props for 75%', () => {
    let {progressProps, subMask1Style, subMask2Style} = useProgressCircle({value: 75, isIndeterminate: false});
    expect(progressProps['aria-valuenow']).toBe(75);
    expect(subMask1Style.transform).toBe('rotate(0deg)');
    expect(subMask2Style.transform).toBe('rotate(-90deg)');
  });

  it('with all of the circle props for 100%', () => {
    let {progressProps, subMask1Style, subMask2Style} = useProgressCircle({value: 100, isIndeterminate: false});
    expect(progressProps['aria-valuenow']).toBe(100);
    expect(subMask1Style.transform).toBe('rotate(0deg)');
    expect(subMask2Style.transform).toBe('rotate(0deg)');
  });
});
