import {AriaNumberFieldProps} from '@react-types/numberfield';
import React from 'react';
import {renderHook} from '@testing-library/react-hooks';
import {useLocale} from '@react-aria/i18n';
import {useNumberField} from '../';
import {useNumberFieldState} from '@react-stately/numberfield';

describe('useNumberField hook', () => {
  let ref;

  beforeEach(() => {
    ref = React.createRef();
    ref.current = {};
    ref.current.addEventListener = () => {};
    ref.current.removeEventListener = () => {};
  });

  let renderNumberFieldHook = (props: AriaNumberFieldProps) => {
    let {result: stateResult} = renderHook(() => useNumberFieldState({...props, locale: useLocale().locale}));
    let {result} = renderHook(() => useNumberField(props, stateResult.current, ref));
    return result.current;
  };

  describe('should return numberFieldProps', () => {
    it('with default numberField props if no props are provided', () => {
      let consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      let {inputProps} = renderNumberFieldHook({});
      expect(inputProps.type).toBe('text');
      expect(inputProps.disabled).toBeFalsy();
      expect(inputProps.readOnly).toBeFalsy();
      expect(inputProps['aria-invalid']).toBeUndefined();
      expect(inputProps['aria-required']).toBeNull();
      expect(inputProps['aria-valuenow']).toBeNull();
      expect(inputProps['aria-valuetext']).toBeNull();
      expect(inputProps['aria-valuemin']).toBeNull();
      expect(inputProps['aria-valuemax']).toBeNull();
      expect(typeof inputProps.onChange).toBe('function');
      expect(inputProps.autoFocus).toBeFalsy();
      expect(consoleWarnSpy).toHaveBeenLastCalledWith('If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility');
    });

    it('with appropriate props if name is defined', () => {
      let {inputProps} = renderNumberFieldHook({name: 'mock-number-input', 'aria-label': 'mandatory label'});
      expect(inputProps['name']).toBe('mock-number-input');
    });

    it('with appropriate props if placeholder is defined', () => {
      let {inputProps} = renderNumberFieldHook({placeholder: 'Enter value', 'aria-label': 'mandatory label'});
      expect(inputProps['placeholder']).toBe('Enter value');
    });
  });
});
