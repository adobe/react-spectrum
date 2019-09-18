import {cleanup, render} from '@testing-library/react';
import React from 'react';
import {UIIcon} from '../';

let FakeIcon = (props) => <svg {...props}><path d="M 10,150 L 70,10 L 130,150 z" /></svg>;

describe('UIIcon', function () {
  afterEach(() => {
    cleanup();
  });

  it.each`
    Name        | Component
    ${'UIIcon'} | ${UIIcon}
  `('handle defaults', function ({Component}) {
    let {getByRole, rerender} = render(<Component aria-label="presentation icon"><FakeIcon /></Component>);

    let icon = getByRole('presentation');
    expect(icon).toHaveAttribute('focusable', 'false');
    expect(icon).toHaveAttribute('aria-label', 'presentation icon');

    rerender(<Component alt="workflow alt"><FakeIcon /></Component>);
    icon = getByRole('presentation');
    expect(icon).toHaveAttribute('aria-label', 'workflow alt');

    rerender(<Component><FakeIcon /></Component>);
    icon = getByRole('presentation');
    expect(icon).not.toHaveAttribute('aria-label');
    expect(icon).toHaveAttribute('aria-hidden');
  });
});
