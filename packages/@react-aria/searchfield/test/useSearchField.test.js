import intlMessages from '../intl/*.json';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {useSearchField} from '../';

describe('useSearchField hook', () => {
  let state = {};
  let setValue = jest.fn();
  let ref = React.createRef();
  let focus = jest.fn();
  let onClear = jest.fn();

  let renderSearchHook = (props, wrapper) => {
    let {result} = renderHook(() => useSearchField(props, state, ref), {wrapper});
    return result.current;
  };

  beforeEach(() => {
    state.value = '';
    state.setValue = setValue;
    ref.current = {focus};
  });

  afterEach(() => {
    setValue.mockClear();
    focus.mockClear();
    onClear.mockClear();
  });

  describe('should return searchFieldProps', () => {
    it('with base props and value equal to state.value', () => {
      let {searchFieldProps} = renderSearchHook({});
      expect(searchFieldProps.type).toBe('search');
      expect(searchFieldProps.value).toBe(state.value);
      expect(typeof searchFieldProps.onKeyDown).toBe('function');
    });

    describe('with specific onKeyDown behavior', () => {
      let preventDefault = jest.fn();
      let onSubmit = jest.fn();
      let event = (key) => ({
        key,
        preventDefault
      });

      afterEach(() => {
        preventDefault.mockClear();
        onSubmit.mockClear();
      });

      it('preventDefault is called for Enter and Escape', () => {
        let {searchFieldProps} = renderSearchHook({});
        searchFieldProps.onKeyDown(event('Enter'));
        expect(preventDefault).toHaveBeenCalledTimes(1);
        searchFieldProps.onKeyDown(event('Escape'));
        expect(preventDefault).toHaveBeenCalledTimes(2);
      });

      it('onSubmit is called if Enter is pressed', () => {
        let {searchFieldProps} = renderSearchHook({onSubmit});
        searchFieldProps.onKeyDown(event('Enter'));
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith(state.value);
      });

      it('pressing the Escape key sets the state value to "" and calls onClear if provided', () => {
        let {searchFieldProps} = renderSearchHook({onClear});
        searchFieldProps.onKeyDown(event('Escape'));
        expect(state.setValue).toHaveBeenCalledTimes(1);
        expect(state.setValue).toHaveBeenCalledWith('', event('Escape'));
        expect(onClear).toHaveBeenCalledTimes(1);
        expect(onClear).toHaveBeenCalledWith(event('Escape'));
      });

      it('onSubmit and onClear aren\'t called if isDisabled is true', () => {
        let {searchFieldProps} = renderSearchHook({isDisabled: true, onClear, onSubmit});
        searchFieldProps.onKeyDown(event('Enter'));
        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(onClear).toHaveBeenCalledTimes(0);
        searchFieldProps.onKeyDown(event('Escape'));
        expect(onSubmit).toHaveBeenCalledTimes(0);
        expect(onClear).toHaveBeenCalledTimes(0);
        expect(preventDefault).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('should return clearButtonProps', () => {
    it('with a localized aria-label', () => {
      let locale = 'de-DE';
      let theme = {
        light: themeLight,
        medium: scaleMedium
      };

      let wrapper = ({children}) => <Provider locale={locale} theme={theme}>{children}</Provider>;
      let expectedIntl = intlMessages[locale]['Clear search'];
      let {clearButtonProps} = renderSearchHook({}, wrapper);
      expect(clearButtonProps['aria-label']).toBe(expectedIntl);
    });

    describe('with specific onPress behavior', () => {
      let mockEvent = {blah: 1};
      it('sets the state to "" and focuses the search field', () => {
        let {clearButtonProps} = renderSearchHook({});
        clearButtonProps.onPress(mockEvent);
        expect(state.setValue).toHaveBeenCalledTimes(1);
        expect(state.setValue).toHaveBeenCalledWith('', mockEvent);
        expect(ref.current.focus).toHaveBeenCalledTimes(1);
      });

      it('calls the user provided onClear if provided', () => {
        let {clearButtonProps} = renderSearchHook({onClear});
        clearButtonProps.onPress(mockEvent);
        // Verify that onClearButtonClick stuff still triggers
        expect(state.setValue).toHaveBeenCalledTimes(1);
        expect(state.setValue).toHaveBeenCalledWith('', mockEvent);
        expect(ref.current.focus).toHaveBeenCalledTimes(1);
        // Verify that props.onClear is triggered as well with the same event
        expect(onClear).toHaveBeenCalledTimes(1);
        expect(onClear).toHaveBeenCalledWith(mockEvent);
      });
    });
  });
});
