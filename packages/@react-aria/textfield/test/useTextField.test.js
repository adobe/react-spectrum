import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useTextField} from '../';

describe('useTextField hook', () => {
  let renderTextFieldHook = (props) => {
    let {result} = renderHook(() => useTextField(props));
    return result.current.inputProps;
  };

  describe('should return textFieldProps', () => {
    it('with default textfield props if no props are provided', () => {
      let props = renderTextFieldHook({});
      expect(props.type).toBe('text');
      expect(props.disabled).toBeFalsy();
      expect(props.readOnly).toBeFalsy();
      expect(props['aria-invalid']).toBeUndefined();
      expect(props['aria-required']).toBeUndefined();
      expect(typeof props.onChange).toBe('function');
      expect(props.autoFocus).toBeFalsy();
    });

    it('with appropriate props if type is defined', () => {
      let type = 'search';
      let props = renderTextFieldHook({type});
      expect(props.type).toBe(type);
    }); 

    it('with appropriate props if isDisabled is defined', () => {
      let props = renderTextFieldHook({isDisabled: true});
      expect(props.disabled).toBeTruthy();

      props = renderTextFieldHook({isDisabled: false});
      expect(props.disabled).toBeFalsy();
    });

    it('with appropriate props if isRequired is defined', () => {
      let props = renderTextFieldHook({isRequired: true});
      expect(props['aria-required']).toBeTruthy();

      props = renderTextFieldHook({isRequired: false});
      expect(props['aria-required']).toBeUndefined();
    });

    it('with appropriate props if isReadOnly is defined', () => {
      let props = renderTextFieldHook({isReadOnly: true});
      expect(props.readOnly).toBeTruthy();

      props = renderTextFieldHook({isReadOnly: false});
      expect(props.readOnly).toBeFalsy();
    });

    it('with appropriate props if validationState is defined', () => {
      let props = renderTextFieldHook({validationState: 'invalid'});
      expect(props['aria-invalid']).toBeTruthy();

      props = renderTextFieldHook({validationState: 'valid'});
      expect(props['aria-invalid']).toBeUndefined();
    });

    it('with appropriate props if autoFocus is defined', () => {
      let props = renderTextFieldHook({autoFocus: true});
      expect(props.autoFocus).toBeTruthy();

      props = renderTextFieldHook({autoFocus: false});
      expect(props.autoFocus).toBeFalsy();
    });

    it('with an onChange that calls user specified onChange with appropriate values', () => {
      let onChange = jest.fn();
      let props = renderTextFieldHook({onChange});
      let mockEvent = {
        target: {
          value: 1
        }
      };
      
      props.onChange(mockEvent);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(mockEvent.target.value, mockEvent);
      onChange.mockClear();
    });
  });
});
