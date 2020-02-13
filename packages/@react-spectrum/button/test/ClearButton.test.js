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
import {cleanup, render} from '@testing-library/react';
import {ClearButton} from '../';
import React from 'react';
import {triggerPress} from '@react-spectrum/test-utils';
import V2Button from '@react/react-spectrum/Button';

// NOTE: ClearButton doesn't use Button.tsx as a base and thus differs from v2 ClearButton in a couple ways
// Refinement of ClearButton to be done later
describe('ClearButton', function () {
  let onPressSpy = jest.fn();
  let FakeIcon = (props) => <svg {...props}><path d="M 10,150 L 70,10 L 130,150 z" /></svg>;

  afterEach(() => {
    cleanup();
    onPressSpy.mockClear();
  });

  it.each`
    Name                | Component      | props
    ${'v3 ClearButton'} | ${ClearButton} | ${{onPress: onPressSpy}}
    ${'v2 ClearButton'} | ${V2Button}    | ${{variant: 'clear', onClick: onPressSpy}}
  `('$Name handles defaults', function ({Component, props}) {
    let {getByRole} = render(<Component {...props}>Click Me</Component>);

    let button = getByRole('button');
    triggerPress(button);
    expect(onPressSpy).toHaveBeenCalledTimes(1);
  });

  it.each`
    Name                | Component      | props
    ${'v3 ClearButton'} | ${ClearButton} | ${{}}
    ${'v2 ClearButton'} | ${V2Button}    | ${{variant: 'clear'}}
  `('$Name allows custom props to be passed through to the button', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} data-foo="bar" aria-hidden>Click Me</Component>);

    let button = getByRole('button');
    expect(button).toHaveAttribute('data-foo', 'bar');
    expect(button).toHaveAttribute('aria-hidden', 'true');
  });

  // Current v3 implementation that diverges from v2
  it.each`
    Name                | Component
    ${'v3 ClearButton'} | ${ClearButton}
  `('$Name doesn\'t accept an icon as a prop', function ({Component}) {
    let mockIcon = <FakeIcon role="status" />;
    let tree = render(<Component icon={mockIcon} />);

    let icon = tree.queryByRole('status');
    expect(icon).toBeNull();
  });

  // Only v3 allows for ref forwarding
  it.each`
    Name                | Component
    ${'v3 ClearButton'} | ${ClearButton}
  `('$Name allows a user to forward a ref to the button', function ({Component}) {
    let ref = React.createRef();
    let tree = render(<Component ref={ref} />);

    let button = tree.queryByRole('button');
    expect(button).toBe(ref.current.UNSAFE_getDOMNode());

    ref.current.focus();
    expect(document.activeElement).toBe(button);
  });
});
