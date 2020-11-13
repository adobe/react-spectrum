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

import {ariaHideOutside} from '../src';
import React from 'react';
import {render, waitFor} from '@testing-library/react';

describe('ariaHideOutside', function () {
  it('should hide everything except the provided element', function () {
    let {getByRole, getAllByRole} = render(
      <>
        <input type="checkbox" />
        <button>Button</button>
        <input type="checkbox" />
      </>
    );

    let checkboxes = getAllByRole('checkbox');
    let button = getByRole('button');

    let revert = ariaHideOutside([button]);

    expect(checkboxes[0]).toHaveAttribute('aria-hidden', 'true');
    expect(checkboxes[1]).toHaveAttribute('aria-hidden', 'true');
    expect(button).not.toHaveAttribute('aria-hidden');

    expect(() => getAllByRole('checkbox')).toThrow();
    expect(() => getByRole('button')).not.toThrow();

    revert();

    expect(checkboxes[0]).not.toHaveAttribute('aria-hidden');
    expect(checkboxes[1]).not.toHaveAttribute('aria-hidden');
    expect(button).not.toHaveAttribute('aria-hidden');

    expect(() => getAllByRole('checkbox')).not.toThrow();
    expect(() => getByRole('button')).not.toThrow();
  });

  it('should hide everything except multiple elements', function () {
    let {getByRole, getAllByRole} = render(
      <>
        <input type="checkbox" />
        <button>Button</button>
        <input type="checkbox" />
      </>
    );

    let checkboxes = getAllByRole('checkbox');
    let button = getByRole('button');

    let revert = ariaHideOutside(checkboxes);

    expect(checkboxes[0]).not.toHaveAttribute('aria-hidden', 'true');
    expect(checkboxes[1]).not.toHaveAttribute('aria-hidden', 'true');
    expect(button).toHaveAttribute('aria-hidden');

    expect(() => getAllByRole('checkbox')).not.toThrow();
    expect(() => getByRole('button')).toThrow();

    revert();

    expect(checkboxes[0]).not.toHaveAttribute('aria-hidden');
    expect(checkboxes[1]).not.toHaveAttribute('aria-hidden');
    expect(button).not.toHaveAttribute('aria-hidden');

    expect(() => getAllByRole('checkbox')).not.toThrow();
    expect(() => getByRole('button')).not.toThrow();
  });

  it('should not traverse into an already hidden container', function () {
    let {getByRole, getAllByRole} = render(
      <>
        <div>
          <input type="checkbox" />
        </div>
        <button>Button</button>
        <input type="checkbox" />
      </>
    );

    let checkboxes = getAllByRole('checkbox');
    let button = getByRole('button');

    let revert = ariaHideOutside([button]);

    expect(checkboxes[0].parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(checkboxes[1]).toHaveAttribute('aria-hidden', 'true');
    expect(button).not.toHaveAttribute('aria-hidden');

    expect(() => getAllByRole('checkbox')).toThrow();
    expect(() => getByRole('button')).not.toThrow();

    revert();

    expect(checkboxes[0].parentElement).not.toHaveAttribute('aria-hidden');
    expect(checkboxes[1]).not.toHaveAttribute('aria-hidden');
    expect(button).not.toHaveAttribute('aria-hidden');

    expect(() => getAllByRole('checkbox')).not.toThrow();
    expect(() => getByRole('button')).not.toThrow();
  });

  it('should not overwrite an existing aria-hidden prop', function () {
    let {getByRole, getAllByRole} = render(
      <>
        <input type="checkbox" aria-hidden="true" />
        <button>Button</button>
        <input type="checkbox" />
      </>
    );

    let checkboxes = getAllByRole('checkbox');
    let button = getByRole('button');

    let revert = ariaHideOutside([button]);

    expect(checkboxes).toHaveLength(1);
    expect(checkboxes[0]).toHaveAttribute('aria-hidden', 'true');
    expect(button).not.toHaveAttribute('aria-hidden');

    expect(() => getAllByRole('checkbox')).toThrow();
    expect(() => getByRole('button')).not.toThrow();

    revert();

    checkboxes = getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(1);
    expect(checkboxes[0]).not.toHaveAttribute('aria-hidden');
    expect(button).not.toHaveAttribute('aria-hidden');

    expect(() => getAllByRole('checkbox')).not.toThrow();
    expect(() => getByRole('button')).not.toThrow();
  });

  it('should handle when a new element is added outside while active', async function () {
    let Test = props => (
      <>
        {props.show && <input type="checkbox" />}
        <button>Button</button>
        {props.show && <input type="checkbox" />}
      </>
    );

    let {getByRole, getAllByRole, rerender} = render(<Test />);

    let button = getByRole('button');
    expect(() => getAllByRole('checkbox')).toThrow();

    let revert = ariaHideOutside([button]);

    rerender(<Test show />);

    // MutationObserver is async
    await waitFor(() => expect(() => getAllByRole('checkbox')).toThrow());
    expect(() => getByRole('button')).not.toThrow();

    revert();

    expect(getAllByRole('checkbox')).toHaveLength(2);
  });

  it('should handle when a new element is added to an already hidden container', async function () {
    let Test = props => (
      <>
        <div data-testid="test">
          {props.show && <input type="checkbox" />}
        </div>
        <button>Button</button>
        {props.show && <input type="checkbox" />}
      </>
    );

    let {getByRole, getAllByRole, getByTestId, rerender} = render(<Test />);

    let button = getByRole('button');
    let test = getByTestId('test');
    expect(() => getAllByRole('checkbox')).toThrow();

    let revert = ariaHideOutside([button]);

    expect(test).toHaveAttribute('aria-hidden');

    rerender(<Test show />);

    // MutationObserver is async
    await waitFor(() => expect(() => getAllByRole('checkbox')).toThrow());
    expect(() => getByRole('button')).not.toThrow();

    let checkboxes = getAllByRole('checkbox', {hidden: true});
    expect(test).toHaveAttribute('aria-hidden');
    expect(checkboxes[0]).not.toHaveAttribute('aria-hidden');
    expect(checkboxes[1]).toHaveAttribute('aria-hidden', 'true');

    revert();

    expect(getAllByRole('checkbox')).toHaveLength(2);
  });

  it('should handle when a new element is added inside a target element', async function () {
    let Test = props => (
      <>
        <input type="checkbox" />
        <div data-testid="test">
          <button>Button</button>
          {props.show && <input type="radio" />}
        </div>
        <input type="checkbox" />
      </>
    );

    let {getByRole, getAllByRole, getByTestId, rerender} = render(<Test />);

    let test = getByTestId('test');
    let revert = ariaHideOutside([test]);

    expect(() => getAllByRole('checkbox')).toThrow();
    expect(() => getByRole('radio')).toThrow();
    expect(() => getByRole('button')).not.toThrow();
    expect(() => getByTestId('test')).not.toThrow();

    rerender(<Test show />);

    // Wait for mutation observer tick
    await Promise.resolve();
    expect(() => getAllByRole('checkbox')).toThrow();
    expect(() => getByRole('radio')).not.toThrow();
    expect(() => getByRole('button')).not.toThrow();
    expect(() => getByTestId('test')).not.toThrow();

    revert();

    expect(() => getAllByRole('checkbox')).not.toThrow();
    expect(() => getByRole('radio')).not.toThrow();
    expect(() => getByRole('button')).not.toThrow();
    expect(() => getByTestId('test')).not.toThrow();
  });

  it('work when called multiple times', function () {
    let {getByRole, getAllByRole} = render(
      <>
        <input type="checkbox" />
        <input type="radio" />
        <button>Button</button>
        <input type="radio" />
        <input type="checkbox" />
      </>
    );

    let radios = getAllByRole('radio');
    let button = getByRole('button');

    let revert1 = ariaHideOutside([button, ...radios]);

    expect(() => getAllByRole('checkbox')).toThrow();
    expect(() => getAllByRole('radio')).not.toThrow();
    expect(() => getByRole('button')).not.toThrow();

    let revert2 = ariaHideOutside([button]);

    expect(() => getAllByRole('checkbox')).toThrow();
    expect(() => getAllByRole('radio')).toThrow();
    expect(() => getByRole('button')).not.toThrow();

    revert2();

    expect(() => getAllByRole('checkbox')).toThrow();
    expect(() => getAllByRole('radio')).not.toThrow();
    expect(() => getByRole('button')).not.toThrow();

    revert1();

    expect(() => getAllByRole('checkbox')).not.toThrow();
    expect(() => getAllByRole('radio')).not.toThrow();
    expect(() => getByRole('button')).not.toThrow();
  });

  it('work when called multiple times and restored out of order', function () {
    let {getByRole, getAllByRole} = render(
      <>
        <input type="checkbox" />
        <input type="radio" />
        <button>Button</button>
        <input type="radio" />
        <input type="checkbox" />
      </>
    );

    let radios = getAllByRole('radio');
    let button = getByRole('button');

    let revert1 = ariaHideOutside([button, ...radios]);

    expect(() => getAllByRole('checkbox')).toThrow();
    expect(() => getAllByRole('radio')).not.toThrow();
    expect(() => getByRole('button')).not.toThrow();

    let revert2 = ariaHideOutside([button]);

    expect(() => getAllByRole('checkbox')).toThrow();
    expect(() => getAllByRole('radio')).toThrow();
    expect(() => getByRole('button')).not.toThrow();

    revert1();

    expect(() => getAllByRole('checkbox')).toThrow();
    expect(() => getAllByRole('radio')).toThrow();
    expect(() => getByRole('button')).not.toThrow();

    revert2();

    expect(() => getAllByRole('checkbox')).not.toThrow();
    expect(() => getAllByRole('radio')).not.toThrow();
    expect(() => getByRole('button')).not.toThrow();
  });
});
