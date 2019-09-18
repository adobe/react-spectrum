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
    expect(icon).toHaveAttribute('aria-hidden');
  });

  it.each`
    Name      | Component
    ${'Icon'} | ${Icon}
  `('$Name handles user provided size', function ({Component}) {
    let tree = render(<Component size="XL"><FakeIcon /></Component>);
    let icon = tree.getByRole('img');
    expect(icon).toHaveAttribute('class', expect.stringContaining('XL'));
  });
});
