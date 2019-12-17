import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useLabel} from '../';

describe('useLabel hook', () => {
  let renderLabelHook = (labelProps) => {
    let {result} = renderHook(() => useLabel(labelProps));
    return result.current;
  };

  it('should return props for visible label', () => {
    let {labelProps, fieldProps} = renderLabelHook({label: 'Test'});
    expect(labelProps.id).toBeDefined();
    expect(fieldProps.id).toBeDefined();
    expect(labelProps.id).toBe(fieldProps['aria-labelledby']);
    expect(labelProps.htmlFor).toBe(fieldProps.id);
    // check that generated ids are unique
    expect(labelProps.id).not.toBe(fieldProps.id);
  });

  it('should combine aria-labelledby if visible label is also provided', () => {
    let {labelProps, fieldProps} = renderLabelHook({label: 'Test', 'aria-labelledby': 'foo'});
    expect(labelProps.id).toBeDefined();
    expect(fieldProps.id).toBeDefined();
    expect(fieldProps['aria-labelledby']).toBe(`foo ${labelProps.id}`);
    expect(labelProps.htmlFor).toBe(fieldProps.id);
    expect(labelProps.id).not.toBe(fieldProps.id);
  });

  it('should combine aria-labelledby if visible label and aria-label is also provided', () => {
    let {labelProps, fieldProps} = renderLabelHook({label: 'Test', 'aria-labelledby': 'foo', 'aria-label': 'aria'});
    expect(labelProps.id).toBeDefined();
    expect(fieldProps.id).toBeDefined();
    expect(fieldProps['aria-label']).toBe('aria');
    expect(fieldProps['aria-labelledby']).toBe(`foo ${labelProps.id} ${fieldProps.id}`);
    expect(labelProps.htmlFor).toBe(fieldProps.id);
    expect(labelProps.id).not.toBe(fieldProps.id);
  });

  it('should work without a visisble label', () => {
    let {labelProps, fieldProps} = renderLabelHook({'aria-label': 'Label'});
    expect(labelProps.id).toBeUndefined();
    expect(labelProps.htmlFor).toBeUndefined();
    expect(fieldProps.id).toBeDefined();
    expect(fieldProps['aria-labelledby']).toBeUndefined();
    expect(fieldProps['aria-label']).toBe('Label');
  });

  it('should work without a visible label and both aria-label and aria-labelledby', () => {
    let {labelProps, fieldProps} = renderLabelHook({'aria-label': 'Label', 'aria-labelledby': 'foo'});
    expect(labelProps.id).toBeUndefined();
    expect(labelProps.htmlFor).toBeUndefined();
    expect(fieldProps.id).toBeDefined();
    expect(fieldProps['aria-labelledby']).toBe(`foo ${fieldProps.id}`);
    expect(fieldProps['aria-label']).toBe('Label');
  });

  it('should warn if no visible label or aria labels are provided', () => {
    let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    renderLabelHook({});
    expect(spyWarn).toHaveBeenCalledWith('If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility');
  });
});
