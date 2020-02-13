/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useTextField} from '../';

describe('useTextField hook', () => {
  let renderTextFieldHook = (props) => {
    let {result} = renderHook(() => useTextField(props));
    return result.current.textFieldProps;
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
      expect(onChange).toHaveBeenCalledWith(mockEvent.target.value);
      onChange.mockClear();
    });
  });
});
