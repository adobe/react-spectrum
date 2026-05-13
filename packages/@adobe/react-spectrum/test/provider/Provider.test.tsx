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

import {act, fireEvent, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {ActionButton} from '../../src/button/ActionButton';
import {Button} from '../../src/button/Button';
import {Checkbox} from '../../src/checkbox/Checkbox';
import {cleanup, setMedia} from 'mock-match-media';
import {Provider} from '../../src/provider/Provider';
import React, {useRef} from 'react';
import {Switch} from '../../src/switch/Switch';
import {TextField} from '../../src/textfield/TextField';
import {useBreakpoint} from '../../src/utils/BreakpointProvider';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';
import userEvent from '@testing-library/user-event';

let theme = {
  global: {},
  light: {'spectrum--light': 'spectrum--light'},
  dark: {'spectrum--dark': 'spectrum--dark'},
  medium: {'spectrum--medium': 'spectrum--medium'},
  large: {'spectrum--large': 'spectrum--large'}
};
let mediaQueryLight = {prefersColorScheme: 'light'};
let mediaQueryDark = {prefersColorScheme: 'dark'};
// mock-match-media drives (min-width: *) queries via viewport `width`, not a `minWidth` media key.
let mediaQueryBelowS = {width: 300};
let mediaQueryAtS = {width: 700};
let mediaQueryAtM = {width: 900};
let mediaQueryAtL = {width: 1100};

describe('Provider', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });
  afterEach(() => {
    cleanup();
  });

  it('Uses OS theme by default - dark', () => {
    setMedia(mediaQueryDark);
    let {getByTestId} = render(
      <Provider theme={theme} data-testid="testid">
        <div>hello</div>
      </Provider>
    );
    let provider = getByTestId('testid');
    expect(provider.classList.contains('spectrum--dark')).toBeTruthy();
  });

  it('Uses OS theme by default - light', () => {
    setMedia(mediaQueryLight);
    let {getByTestId} = render(
      <Provider theme={theme} data-testid="testid">
        <div>hello</div>
      </Provider>
    );
    let provider = getByTestId('testid');
    expect(provider.classList.contains('spectrum--light')).toBeTruthy();
  });

  it('Can be set to dark regardless of OS setting', () => {
    setMedia(mediaQueryLight);
    let {getByTestId} = render(
      <Provider theme={theme} colorScheme="dark" data-testid="testid">
        <div>hello</div>
      </Provider>
    );
    let provider = getByTestId('testid');
    expect(provider.classList.contains('spectrum--dark')).toBeTruthy();
  });

  it('Provider passes props to children', async () => {
    let onChangeSpy = jest.fn();
    let {getByLabelText} = render(
      <Provider theme={theme} isReadOnly>
        <Checkbox onChange={onChangeSpy}>Test Checkbox</Checkbox>
        <Switch onChange={onChangeSpy}>Test Switch</Switch>
      </Provider>
    );

    let checkbox = getByLabelText('Test Checkbox');
    let switchComponent = getByLabelText('Test Switch');

    expect(switchComponent).toHaveAttribute('aria-readonly', 'true');
    expect(checkbox).toHaveAttribute('aria-readonly', 'true');

    await user.click(checkbox);
    await user.click(switchComponent);

    expect(onChangeSpy).not.toHaveBeenCalled();
    onChangeSpy.mockClear();
  });

  it('Nested providers follow their ancestors by default, not the OS', () => {
    setMedia(mediaQueryLight);
    let {getByTestId} = render(
      <Provider theme={theme} colorScheme="dark" data-testid="testid1">
        <Provider data-testid="testid2">
          <div>hello</div>
        </Provider>
      </Provider>
    );
    let provider1 = getByTestId('testid1');
    let provider2 = getByTestId('testid2');
    expect(provider1.classList.contains('spectrum--dark')).toBeTruthy();
    expect(provider2.classList.contains('spectrum--dark')).toBeTruthy();
  });

  it('Nested providers can update to follow their ancestors', () => {
    setMedia(mediaQueryDark);
    let NestedProviders = props => (
      <Provider theme={theme} colorScheme={props.colorScheme} data-testid="testid1">
        <Provider data-testid="testid2">
          <div>hello</div>
        </Provider>
      </Provider>
    );
    let {getByTestId, rerender} = render(<NestedProviders />);
    let provider1 = getByTestId('testid1');
    let provider2 = getByTestId('testid2');
    expect(provider1.classList.contains('spectrum--dark')).toBeTruthy();
    expect(provider2.classList.contains('spectrum--dark')).toBeTruthy();

    rerender(<NestedProviders colorScheme="light" />);
    provider1 = getByTestId('testid1');
    provider2 = getByTestId('testid2');
    expect(provider1.classList.contains('spectrum--light')).toBeTruthy();
    expect(provider2.classList.contains('spectrum--light')).toBeTruthy();
  });

  it('Nested providers can be explicitly set to something else', () => {
    setMedia(mediaQueryLight);
    let {getByTestId} = render(
      <Provider theme={theme} colorScheme="dark" data-testid="testid1">
        <Provider colorScheme="light" data-testid="testid2">
          <div>hello</div>
        </Provider>
      </Provider>
    );
    let provider1 = getByTestId('testid1');
    let provider2 = getByTestId('testid2');
    expect(provider1.classList.contains('spectrum--dark')).toBeTruthy();
    expect(provider2.classList.contains('spectrum--light')).toBeTruthy();
  });

  it('Nested providers pass props to children', async () => {
    let onPressSpy = jest.fn();
    let {getByRole} = render(
      <Provider theme={theme} isDisabled>
        <Provider isQuiet>
          <ActionButton onPress={onPressSpy}>Hello!</ActionButton>
        </Provider>
      </Provider>
    );
    let button = getByRole('button');
    await user.click(button);
    expect(onPressSpy).not.toHaveBeenCalled();
    expect(button.classList.contains('spectrum-ActionButton--quiet')).toBeTruthy();
    onPressSpy.mockClear();
  });

  it('will render an available color scheme automatically if the previous does not exist on the new theme', () => {
    setMedia(mediaQueryDark);
    let {getByTestId} = render(
      <Provider theme={theme} data-testid="testid1">
        <Provider
          theme={{
            global: {},
            light: {'spectrum--light': 'spectrum--light'},
            medium: {'spectrum--medium': 'spectrum--medium'},
            large: {'spectrum--large': 'spectrum--large'}
          }}
          data-testid="testid2">
          <Button variant="accent">Hello!</Button>
        </Provider>
      </Provider>
    );
    let provider1 = getByTestId('testid1');
    let provider2 = getByTestId('testid2');
    expect(provider1.classList.contains('spectrum--dark')).toBeTruthy();
    expect(provider2.classList.contains('spectrum--light')).toBeTruthy();
  });

  it('Provider will rerender if the OS preferred changes and it is on auto', () => {
    setMedia(mediaQueryLight);
    let {getByTestId} = render(
      <Provider theme={theme} data-testid="testid1">
        <Provider data-testid="testid2">
          <div>hello</div>
        </Provider>
      </Provider>
    );
    let provider1 = getByTestId('testid1');
    let provider2 = getByTestId('testid2');
    expect(provider1.classList.contains('spectrum--light')).toBeTruthy();
    expect(provider2.classList.contains('spectrum--light')).toBeTruthy();

    act(() => {
      setMedia(mediaQueryDark);
    });

    expect(provider1.classList.contains('spectrum--dark')).toBeTruthy();
    expect(provider2.classList.contains('spectrum--dark')).toBeTruthy();
  });

  describe('responsive styles', function () {
    let breakpoints = {S: 480, M: 640, L: 1024};
    // jsdom/cssstyle doesn't support var() yet, so we need to use other values
    it.each`
      name                    | mediaquery           | props            | expected
      ${'default'}            | ${mediaQueryBelowS}  | ${{}}            | ${'192px'}
      ${'default'}            | ${mediaQueryAtS}     | ${{}}            | ${'1000px'}
      ${'default'}            | ${mediaQueryAtM}     | ${{}}            | ${'2000px'}
      ${'default'}            | ${mediaQueryAtL}     | ${{}}            | ${'3000px'}
      ${'custom breakpoints'} | ${mediaQueryBelowS}  | ${{breakpoints}} | ${'192px'}
      ${'custom breakpoints'} | ${{width: 500}}      | ${{breakpoints}} | ${'1000px'}
      ${'custom breakpoints'} | ${{width: 800}}     | ${{breakpoints}} | ${'2000px'}
      ${'custom breakpoints'} | ${{width: 1100}}    | ${{breakpoints}} | ${'3000px'}
    `('$name $mediaquery', function ({mediaquery, props, expected}) {
      setMedia(mediaquery);
      let {getByTestId} = render(
        <Provider theme={theme} data-testid="testid1" {...props}>
          <TextField label="foo" width={{base: '192px', S: '1000px', M: '2000px', L: '3000px'}} />
        </Provider>
      );
      // use provider to get at the outer div, any props on TextField will end up on the input
      let provider = getByTestId('testid1');
      let field = provider.firstChild;
      expect(field).toHaveStyle({width: expected});
    });

    it.each`
      mediaquery          | expected
      ${mediaQueryBelowS} | ${'192px'}
      ${mediaQueryAtS}    | ${'192px'}
      ${mediaQueryAtM}    | ${'192px'}
      ${mediaQueryAtL}    | ${'3000px'}
    `('omitted sizes $mediaquery', function ({mediaquery, expected}) {
      setMedia(mediaquery);
      let {getByTestId} = render(
        <Provider theme={theme} data-testid="testid1">
          <TextField label="foo" width={{base: '192px', L: '3000px'}} />
        </Provider>
      );
      let provider = getByTestId('testid1');
      let field = provider.firstChild;
      expect(field).toHaveStyle({width: expected});
    });

    it('only renders once for multiple resizes in the same range', function () {
      function Component(props) {
        let {matchedBreakpoints} = useBreakpoint()!;
        let {onBreakpointChange, ...otherProps} = props;
        let prevBreakpoint = useRef<string>(null);
        let breakpoint = matchedBreakpoints[0];
        useLayoutEffect(() => {
          if (!Object.is(prevBreakpoint.current, breakpoint)) {
            onBreakpointChange(breakpoint);
          }
          prevBreakpoint.current = breakpoint;
        }, [onBreakpointChange, breakpoint]);
        return <button {...otherProps}>push me</button>;
      }

      setMedia(mediaQueryAtM);

      let onBreakpointChange = jest.fn();
      render(
        <Provider theme={theme}>
          <Component onBreakpointChange={onBreakpointChange} />
        </Provider>
      );
      expect(onBreakpointChange).toHaveBeenCalledTimes(1);
      expect(onBreakpointChange).toHaveBeenNthCalledWith(1, 'M');

      setMedia(mediaQueryAtL);
      fireEvent(window, new Event('resize'));

      expect(onBreakpointChange).toHaveBeenCalledTimes(2);
      expect(onBreakpointChange).toHaveBeenNthCalledWith(2, 'L');

      fireEvent(window, new Event('resize'));

      // shouldn't fire again for something in the same range as before
      expect(onBreakpointChange).toHaveBeenCalledTimes(2);
    });
  });
});
