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

import {Button} from '@react-spectrum/button';
import {ButtonGroup} from '../';
import {cleanup, render, within} from '@testing-library/react';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {triggerPress} from '@react-spectrum/test-utils';
import V2Button from '@react/react-spectrum/Button';
import V2ButtonGroup from '@react/react-spectrum/ButtonGroup';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

let buttonGroupId = 'button-group';
let onPressSpy1 = jest.fn();
let onPressSpy2 = jest.fn();
let onPressSpy3 = jest.fn();

function renderComponent(Component, props = {}) {
  if (Component === V2ButtonGroup) {
    return render(
      <Provider theme={theme}>
        <V2ButtonGroup data-testid={buttonGroupId} {...props}>
          <V2Button>
            Button1
          </V2Button>
          <V2Button>
            Button2
          </V2Button>
          <V2Button>
            Button3
          </V2Button>
        </V2ButtonGroup>
      </Provider>
    );
  } else {
    return render(
      <Provider theme={theme}>
        <ButtonGroup data-testid={buttonGroupId} {...props}>
          <Button onPress={onPressSpy1} variant="primary">
            Button1
          </Button>
          <Button onPress={onPressSpy2} variant="primary">
            Button2
          </Button>
          <Button onPress={onPressSpy3} variant="primary">
            Button3
          </Button>
        </ButtonGroup>
      </Provider>
    );
  }
}

describe('ButtonGroup', function () {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  // Skipping v2 tests since they don't work in the repo yet
  it.each`
    Name               | Component        | props
    ${'ButtonGroup'}   | ${ButtonGroup}   | ${{}}
  `('$Name renders multiple buttons', function ({Component, props}) {
    let tree = renderComponent(Component, props);
    let buttonGroup = tree.getByTestId(buttonGroupId);
    expect(buttonGroup).toBeTruthy();

    let button1 = within(buttonGroup).getByText('Button1');
    let button2 = within(buttonGroup).getByText('Button2');
    let button3 = within(buttonGroup).getByText('Button3');

    expect(button1).toBeTruthy();
    expect(button2).toBeTruthy();
    expect(button3).toBeTruthy();

    triggerPress(button1);
    triggerPress(button2);
    triggerPress(button3);

    expect(onPressSpy1).toHaveBeenCalledTimes(1);
    expect(onPressSpy2).toHaveBeenCalledTimes(1);
    expect(onPressSpy3).toHaveBeenCalledTimes(1);
  });

  it.each`
    Name               | Component        | props
    ${'ButtonGroup'}   | ${ButtonGroup}   | ${{UNSAFE_className: 'custom class'}}
  `('$Name supports UNSAFE_className', function ({Component, props}) {
    let tree = renderComponent(Component, props);
    let buttonGroup = tree.getByTestId(buttonGroupId);
    expect(buttonGroup).toBeTruthy();
    expect(buttonGroup).toHaveAttribute('class', expect.stringContaining('custom class'));
  });

  it.each`
    Name               | Component        | props
    ${'ButtonGroup'}   | ${ButtonGroup}   | ${{}}
  `('$Name supports attaching a ref to the button group', function ({Component}) {
    let ref = React.createRef();
    let tree = renderComponent(Component, {ref});
    let buttonGroup = tree.getByTestId(buttonGroupId);
    expect(buttonGroup).toEqual(ref.current.UNSAFE_getDOMNode());
  });

  it.each`
    Name               | Component        | props
    ${'ButtonGroup'}   | ${ButtonGroup}   | ${{isDisabled: true}}
  `('$Name supports disabling all buttons within via isDisabled', function ({Component, props}) {
    let tree = renderComponent(Component, props);
    let buttonGroup = tree.getByTestId(buttonGroupId);
    expect(buttonGroup).toBeTruthy();

    let button1 = within(buttonGroup).getByText('Button1');
    let button2 = within(buttonGroup).getByText('Button2');
    let button3 = within(buttonGroup).getByText('Button3');

    triggerPress(button1);
    triggerPress(button2);
    triggerPress(button3);

    expect(onPressSpy1).toHaveBeenCalledTimes(0);
    expect(onPressSpy2).toHaveBeenCalledTimes(0);
    expect(onPressSpy3).toHaveBeenCalledTimes(0);
  });

  // TODO: Retool this one to check for aria-orientation when ButtonGroup is finalized
  it.each`
    Name               | Component        | props
    ${'ButtonGroup'}   | ${ButtonGroup}   | ${{orientation: 'vertical'}}
  `('$Name supports vertical orientation', function ({Component, props}) {
    let tree = renderComponent(Component, props);
    let buttonGroup = tree.getByTestId(buttonGroupId);
    expect(buttonGroup).toBeTruthy();
    expect(buttonGroup).toHaveAttribute('class', expect.stringContaining('spectrum-ButtonGroup--vertical'));
  });

// Test that it handles the useEffect wrapping?
});
