import {AriaNumberFieldProps} from '@react-types/numberfield';
import React from 'react';
import {renderHook} from '@react-spectrum/test-utils-internal';
import {useLocale} from '@react-aria/i18n';
import {useNumberField} from '../';
import {useNumberFieldState} from '@react-stately/numberfield';

describe('useNumberField hook', () => {
  let ref;

  beforeEach(() => {
    ref = React.createRef();
    ref.current = document.createElement('input');
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
      expect(inputProps['aria-required']).toBeUndefined();
      expect(inputProps['aria-valuenow']).toBeNull();
      expect(inputProps['aria-valuetext']).toBeNull();
      expect(inputProps['aria-valuemin']).toBeNull();
      expect(inputProps['aria-valuemax']).toBeNull();
      expect(typeof inputProps.onChange).toBe('function');
      expect(inputProps.autoFocus).toBeFalsy();
      expect(consoleWarnSpy).toHaveBeenLastCalledWith('If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility');
    });

    it('with appropriate props if placeholder is defined', () => {
      let {inputProps} = renderNumberFieldHook({placeholder: 'Enter value', 'aria-label': 'mandatory label'});
      expect(inputProps['placeholder']).toBe('Enter value');
    });

    it('all events are merged into the input element', () => {
      let onCopy = jest.fn();
      let onCut = jest.fn();
      let onPaste = jest.fn();
      let onCompositionStart = jest.fn();
      let onCompositionEnd = jest.fn();
      let onCompositionUpdate = jest.fn();
      let onSelect = jest.fn();
      let onBeforeInput = jest.fn();
      let onInput = jest.fn();
      let {inputProps} = renderNumberFieldHook({
        'aria-label': 'mandatory label',
        onCopy,
        onCut,
        onPaste,
        onCompositionStart,
        onCompositionEnd,
        onCompositionUpdate,
        onSelect,
        onBeforeInput,
        onInput
      });
      inputProps.onCopy?.({} as any);
      expect(onCopy).toHaveBeenCalled();
      inputProps.onCut?.({} as any);
      expect(onCut).toHaveBeenCalled();
      inputProps.onPaste?.({} as any);
      expect(onPaste).toHaveBeenCalled();
      inputProps.onCompositionStart?.({} as any);
      expect(onCompositionStart).toHaveBeenCalled();
      inputProps.onCompositionEnd?.({} as any);
      expect(onCompositionEnd).toHaveBeenCalled();
      inputProps.onCompositionUpdate?.({} as any);
      expect(onCompositionUpdate).toHaveBeenCalled();
      inputProps.onSelect?.({} as any);
      expect(onSelect).toHaveBeenCalled();
      inputProps.onBeforeInput?.({
        preventDefault: jest.fn(),
        target: {
          value: '',
          selectionStart: 0,
          selectionEnd: 0,
          data: ''
        }
      } as any);
      expect(onBeforeInput).toHaveBeenCalled();
      inputProps.onInput?.({} as any);
      expect(onInput).toHaveBeenCalled();
    });
  });
});
