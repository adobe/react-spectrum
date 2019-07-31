import {cleanup, render} from '@testing-library/react';
import React, {useRef} from 'react';
import {useDialog} from '../';

function Example(props) {
  let ref = useRef();
  let {dialogProps} = useDialog({ref, ...props});
  return <div ref={ref} {...dialogProps} data-testid="test">{props.children}</div>;
}

describe('useDialog', function () {
  afterEach(cleanup);

  it('should have role="dialog" by default', function () {
    let res = render(<Example />);
    let el = res.getByTestId('test');
    expect(el).toHaveAttribute('role', 'dialog');
  });

  it('should accept role="alertdialog"', function () {
    let res = render(<Example role="alertdialog" />);
    let el = res.getByTestId('test');
    expect(el).toHaveAttribute('role', 'alertdialog');
  });

  it('should focus the overlay on mount', function () {
    let res = render(<Example />);
    let el = res.getByTestId('test');
    expect(el).toHaveAttribute('tabIndex', '-1');
    expect(document.activeElement).toBe(el);
  });

  it('should not focus the overlay if something inside is auto focused', function () {
    let res = render(
      <Example>
        <input data-testid="input" autoFocus />
      </Example>
    );
    let input = res.getByTestId('input');
    expect(document.activeElement).toBe(input);
  });
});
