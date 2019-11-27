import {cleanup, render, within} from '@testing-library/react';
import {Form} from '../';
import React from 'react';
import {Form as V2Form} from '@react/react-spectrum/Form';

describe('Form', () => {
  afterEach(() => {
    cleanup();
  }); 

  it.each`
    Name         | Component
    ${'v3 Form'} | ${Form}
    ${'v2 Form'} | ${V2Form}
  `('$Name should render a form', ({Component}) => {
    let tree = render(<Component />);
    let form = tree.getByRole('form');
    expect(form).toBeTruthy();
  });

  it.each`
    Name         | Component
    ${'v3 Form'} | ${Form}
    ${'v2 Form'} | ${V2Form}
  `('$Name should render children inside the form', ({Component}) => {
    let tree = render(
      <Component>
        <button>Hi</button>
      </Component>
    );
    let form = tree.getByRole('form');
    expect(within(form).getByRole('button')).toBeTruthy();
  });

  it.each`
    Name         | Component
    ${'v3 Form'} | ${Form}
  `('$Name should attach a optional user provided ref to the form', ({Component}) => {
    let ref = React.createRef();
    let tree = render(<Component ref={ref} />);
    let form = tree.getByRole('form');
    expect(form).toBe(ref.current);
  });

  it.each`
    Name         | Component
    ${'v3 Form'} | ${Form}
    ${'v2 Form'} | ${V2Form}
  `('$Name should support additional DOM props', ({Component}) => {
    let tree = render(<Component data-testid="foo" />);
    let form = tree.getByRole('form');
    expect(form).toHaveAttribute('data-testid', 'foo');
  });

  it.each`
    Name         | Component  | props
    ${'v3 Form'} | ${Form}    | ${{UNSAFE_className: 'test-name'}}
    ${'v2 Form'} | ${V2Form}  | ${{className: 'test-name'}}
  `('$Name should support UNSAFE_className', ({Component, props}) => {
    let tree = render(<Component {...props} />);
    let form = tree.getByRole('form');
    expect(form).toHaveAttribute('class', expect.stringContaining('test-name'));
  });
});
