import {cleanup, render} from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';
import {useModal} from '../';

function Example(props) {
  useModal();
  return (
    <div />
  );
}

describe('useModal', function () {
  afterEach(cleanup);

  it('should set overflow: hidden on the body on mount and remove on unmount', function () {
    expect(document.body).not.toHaveStyle('overflow: hidden');

    let res = render(<Example />);
    expect(document.body).toHaveStyle('overflow: hidden');

    res.unmount();
    expect(document.body).not.toHaveStyle('overflow: hidden');
  });

  it('should work with nested modals', function () {
    expect(document.body).not.toHaveStyle('overflow: hidden');

    let one = render(<Example />);
    expect(document.body).toHaveStyle('overflow: hidden');

    let two = render(<Example />);
    expect(document.body).toHaveStyle('overflow: hidden');

    two.unmount();
    expect(document.body).toHaveStyle('overflow: hidden');

    one.unmount();
    expect(document.body).not.toHaveStyle('overflow: hidden');
  });
});
