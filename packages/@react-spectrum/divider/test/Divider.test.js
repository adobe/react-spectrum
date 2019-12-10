import {cleanup, render} from '@testing-library/react';
import {Divider} from '../';
import React from 'react';
import Rule from '@react/react-spectrum/Rule';

describe('Divider', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name         | Component  | props
    ${'Divider'} | ${Divider} | ${{}}
    ${'Rule'}    | ${Rule}    | ${{}}
    ${'Divider'} | ${Divider} | ${{size: 'M'}}
    ${'Rule'}    | ${Rule}    | ${{variant: 'medium'}}
    ${'Divider'} | ${Divider} | ${{size: 'S'}}
    ${'Rule'}    | ${Rule}    | ${{variant: 'small'}}
  `('$Name handles defaults', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} aria-label="divides" />);

    let divider = getByRole('separator');
    expect(divider).toBeTruthy();
    expect(divider).not.toHaveAttribute('aria-orientation');
    expect(divider).toHaveAttribute('aria-label', 'divides');
  });

  // V2 doesn't have a vertical Rule, this is new to Divider
  it.each`
    Name         | Component  | props
    ${'Divider'} | ${Divider} | ${{orientation: 'vertical'}}
    ${'Divider'} | ${Divider} | ${{orientation: 'vertical', size: 'M'}}
    ${'Divider'} | ${Divider} | ${{orientation: 'vertical', size: 'S'}}
  `('$Name can be vertical', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} aria-label="divides" />);

    let divider = getByRole('separator');
    expect(divider).toBeTruthy();
    expect(divider).toHaveAttribute('aria-orientation', 'vertical');
    expect(divider).toHaveAttribute('aria-label', 'divides');
  });

  it.each`
    Name         | Component
    ${'Divider'} | ${Divider}
  `('$Name should not include implicit attributes', function ({Component}) {
    let {getByRole} = render(<Component aria-label="divides" />);

    let divider = getByRole('separator');
    expect(divider).not.toHaveAttribute('aria-orientation');
  });

  it.each`
    Name         | Component  | props
    ${'Divider'} | ${Divider} | ${{}}
  `('$Name forwards the ref', function ({Component, props}) {
    let ref = React.createRef();
    let {getByRole} = render(<Component {...props} aria-label="divides" ref={ref} />);

    let divider = getByRole('separator');
    expect(divider).toBe(ref.current.UNSAFE_getDOMNode());
  });
});
