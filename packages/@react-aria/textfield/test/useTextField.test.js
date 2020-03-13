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
      let consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      let props = renderTextFieldHook({});
      expect(props.type).toBe('text');
      expect(props.disabled).toBeFalsy();
      expect(props.readOnly).toBeFalsy();
      expect(props['aria-invalid']).toBeUndefined();
      expect(props['aria-required']).toBeUndefined();
      expect(typeof props.onChange).toBe('function');
      expect(props.autoFocus).toBeFalsy();
      expect(consoleWarnSpy).toHaveBeenLastCalledWith('If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility');
    });

    it('with appropriate props if type is defined', () => {
      let type = 'search';
      let props = renderTextFieldHook({type, 'aria-label': 'mandatory label'});
      expect(props.type).toBe(type);
    });

    it('with appropriate props if isDisabled is defined', () => {
      let props = renderTextFieldHook({isDisabled: true, 'aria-label': 'mandatory label'});
      expect(props.disabled).toBeTruthy();

      props = renderTextFieldHook({isDisabled: false, 'aria-label': 'mandatory label'});
      expect(props.disabled).toBeFalsy();
    });

    it('with appropriate props if isRequired is defined', () => {
      let props = renderTextFieldHook({isRequired: true, 'aria-label': 'mandatory label'});
      expect(props['aria-required']).toBeTruthy();

      props = renderTextFieldHook({isRequired: false, 'aria-label': 'mandatory label'});
      expect(props['aria-required']).toBeUndefined();
    });

    it('with appropriate props if isReadOnly is defined', () => {
      let props = renderTextFieldHook({isReadOnly: true, 'aria-label': 'mandatory label'});
      expect(props.readOnly).toBeTruthy();

      props = renderTextFieldHook({isReadOnly: false, 'aria-label': 'mandatory label'});
      expect(props.readOnly).toBeFalsy();
    });

    it('with appropriate props if validationState is defined', () => {
      let props = renderTextFieldHook({validationState: 'invalid', 'aria-label': 'mandatory label'});
      expect(props['aria-invalid']).toBeTruthy();

      props = renderTextFieldHook({validationState: 'valid', 'aria-label': 'mandatory label'});
      expect(props['aria-invalid']).toBeUndefined();
    });

    it('with appropriate props if autoFocus is defined', () => {
      let props = renderTextFieldHook({autoFocus: true, 'aria-label': 'mandatory label'});
      expect(props.autoFocus).toBeTruthy();

      props = renderTextFieldHook({autoFocus: false, 'aria-label': 'mandatory label'});
      expect(props.autoFocus).toBeFalsy();
    });

    it('with an onChange that calls user specified onChange with appropriate values', () => {
      let onChange = jest.fn();
      let props = renderTextFieldHook({onChange, 'aria-label': 'mandatory label'});
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
