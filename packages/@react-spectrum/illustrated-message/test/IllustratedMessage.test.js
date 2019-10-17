import {cleanup, render} from '@testing-library/react';
import {IllustratedMessage} from '../';
import React from 'react';
import V2IllustratedMessage from '@react/react-spectrum/IllustratedMessage';

function Image(props) {
  return (<svg {...props}><path /></svg>);
}

describe('IllustratedMessage', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name                       | Component               | props
    ${'IllustratedMessage'}    | ${IllustratedMessage}   | ${{heading: 'foo', description: 'bar', illustration: <Image />}}
    ${'V2IllustratedMessage'}  | ${V2IllustratedMessage} | ${{heading: 'foo', description: 'bar', illustration: <Image />}}
  `('$Name should treat the illustration as decorative by default', function ({Component, props}) {
    let {getByRole, getByText, container} = render(<Component {...props} />);

    let illustration;
    if (Component === IllustratedMessage) {
      illustration = getByRole('presentation');
    } else {
      illustration = container.querySelector('svg');
    }
    expect(illustration).toHaveAttribute('aria-hidden', 'true');
    getByText('foo');
    getByText('bar');
  });

  it.each`
    Name                       | Component               | props
    ${'IllustratedMessage'}    | ${IllustratedMessage}   | ${{heading: 'foo', description: 'bar', illustration: <Image aria-label="baz" />}}
    ${'V2IllustratedMessage'}  | ${V2IllustratedMessage} | ${{heading: 'foo', description: 'bar', illustration: <Image aria-label="baz" />}}
  `('$Name should not be decorative if the svg is labelled', function ({Component, props}) {
    let {getByLabelText} = render(<Component {...props} />);

    let illustration = getByLabelText('baz');
    expect(illustration).not.toHaveAttribute('aria-hidden');
    if (Component === IllustratedMessage) {
      expect(illustration).toHaveAttribute('role', 'img');
    }
  });

  it.each`
    Name                       | Component               | props
    ${'IllustratedMessage'}    | ${IllustratedMessage}   | ${{heading: 'foo', description: 'bar', illustration: <Image aria-hidden aria-label="its hidden" />}}
    ${'V2IllustratedMessage'}  | ${V2IllustratedMessage} | ${{heading: 'foo', description: 'bar', illustration: <Image aria-hidden aria-label="its hidden" />}}
  `('$Name should be hidden if aria-hidden is specifically set on the illustration', function ({Component, props}) {
    let {getByRole, container} = render(<Component {...props} />);

    let illustration;
    if (Component === IllustratedMessage) {
      illustration = getByRole('presentation');
    } else {
      illustration = container.querySelector('svg');
    }
    expect(illustration).toHaveAttribute('aria-hidden', 'true');
  });

  it.each`
    Name                       | Component               | props
    ${'IllustratedMessage'}    | ${IllustratedMessage}   | ${{heading: 'foo', description: 'bar', illustration: <Image />, 'aria-level': 3}}
    ${'V2IllustratedMessage'}  | ${V2IllustratedMessage} | ${{heading: 'foo', description: 'bar', illustration: <Image />, 'ariaLevel': 3}}
  `('$Name should support aria-level on the header', function ({Component, props}) {
    let {getByText} = render(<Component {...props} />);

    let header = getByText('foo');
    expect(header).toHaveAttribute('aria-level', '3');
  });
});
