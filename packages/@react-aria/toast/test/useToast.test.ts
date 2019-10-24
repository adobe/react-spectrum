import {cleanup, render} from '@testing-library/react';
import {renderHook} from 'react-hooks-testing-library';
import React from 'react';
import {useToast} from '../';

describe('useToast', function () {
  afterEach(cleanup);

  let renderToastkHook = (props) => {
    let {result} = renderHook(() => useToast(props));
    return result.current;
  };

  it('handles defaults', function () {
    let {actionButtonProps, closeButtonProps, iconProps, toastProps} = renderToastkHook({});

    expect(toastProps.role).toBe('alert');
    expect(iconProps.alt).toBe(undefined);
    expect(typeof actionButtonProps.onPress).toBe('function');
    expect(closeButtonProps['aria-label']).toBe('Close');
    expect(closeButtonProps.onPress).toBe(undefined);
  });

  it('variant sets icon alt', function () {
    let {iconProps} = renderToastkHook({variant: 'info',});

    expect(iconProps.alt).toBe('Info');
  });

  it('variant sets icon alt', function () {
    let onClose = jest.fn();
    let {actionButtonProps} = renderToastkHook({onClose});
    actionButtonProps.onPress();

    expect(onClose).toHaveBeenCalledTimes(1);
    onClose.mockClear();
  });

  /* it('handles custom children', function () {
    let {toastProps} = renderToastkHook({children: <div>Test Link</div>});
    expect(toastProps.role).toBeUndefined();
    expect(toastProps.tabIndex).toBeUndefined();
    expect(toastProps.id).toBeDefined();
  });

  it('handles href warning', function () {
    let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    renderToastkHook({children: 'Test Link', href: '#'});
    expect(spyWarn).toHaveBeenCalledWith('href is deprecated, please use an anchor element as children');
  });

  it('handles onClick warning', function () {
    let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    let {toastProps} = renderToastkHook({children: 'Test Link', onClick: () => {}});
    toastProps.onClick();
    expect(spyWarn).toHaveBeenCalledWith('onClick is deprecated, please use onPress');
  });*/
});
