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
import {Icon} from '../';
import React from 'react';

let FakeIcon = (props) => <svg {...props}><path d="M 10,150 L 70,10 L 130,150 z" /></svg>;

describe('Icon', function () {
  afterEach(() => {
    cleanup();
  });

  it.each`
    Name      | Component
    ${'Icon'} | ${Icon}
  `('$Name handles alt texts', function ({Component}) {
    let {getByRole, rerender} = render(<Component aria-label="workflow icon"><FakeIcon /></Component>);

    let icon = getByRole('img');
    expect(icon).toHaveAttribute('focusable', 'false');
    expect(icon).toHaveAttribute('aria-label', 'workflow icon');

    rerender(<Component alt="workflow alt"><FakeIcon /></Component>);
    icon = getByRole('img');
    expect(icon).toHaveAttribute('aria-label', 'workflow alt');

    rerender(<Component><FakeIcon /></Component>);
    icon = getByRole('img');
    expect(icon).not.toHaveAttribute('aria-label');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it.each`
    Name      | Component
    ${'Icon'} | ${Icon}
  `('$Name handles user provided size', function ({Component}) {
    let tree = render(<Component size="XL"><FakeIcon /></Component>);
    let icon = tree.getByRole('img');
    expect(icon).toHaveAttribute('class', expect.stringContaining('XL'));
  });

  it.each`
    Name      | Component
    ${'Icon'} | ${Icon}
  `('$Name supports role prop override', function ({Component}) {
    let {getByRole, rerender} = render(<Component role="presentation"><FakeIcon /></Component>);

    let icon = getByRole('presentation');
    expect(icon).toHaveAttribute('focusable', 'false');
    expect(icon).toHaveAttribute('aria-hidden', 'true');

    rerender(<Component role="alert" alt="alt"><FakeIcon /></Component>);
    icon = getByRole('alert');
    expect(icon).toHaveAttribute('aria-label', 'alt');
    expect(icon).not.toHaveAttribute('aria-hidden');

    rerender(<Component role="alert" aria-label="aria-label"><FakeIcon /></Component>);
    icon = getByRole('alert');
    expect(icon).toHaveAttribute('aria-label', 'aria-label');
    expect(icon).not.toHaveAttribute('aria-hidden');

    rerender(<Component role="alert"><FakeIcon /></Component>);
    icon = getByRole('alert');
    expect(icon).not.toHaveAttribute('aria-label');
    expect(icon).toHaveAttribute('aria-hidden', 'true');

    rerender(<Component><FakeIcon /></Component>);
    icon = getByRole('img');
    expect(icon).not.toHaveAttribute('aria-label');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it.each`
    Name      | Component
    ${'Icon'} | ${Icon}
  `('$Name supports aria-hidden prop', function ({Component}) {
    let {getByRole, rerender} = render(<Component alt="explicitly hidden alt" aria-hidden="true"><FakeIcon /></Component>);

    let icon = getByRole('img');
    expect(icon).toHaveAttribute('aria-label', 'explicitly hidden alt');
    expect(icon).toHaveAttribute('aria-hidden', 'true');

    rerender(<Component aria-label="explicitly not hidden aria-label" aria-hidden="false"><FakeIcon /></Component>);
    icon = getByRole('img');
    expect(icon).toHaveAttribute('aria-label', 'explicitly not hidden aria-label');
    expect(icon).not.toHaveAttribute('aria-hidden');
  });
});
