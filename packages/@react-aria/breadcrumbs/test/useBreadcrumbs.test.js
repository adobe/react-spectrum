import {cleanup, render} from '@testing-library/react';
import React, {useRef} from 'react';
import {useBreadcrumbs} from '../';

describe('useBreadcrumbs', function () {
  afterEach(cleanup);

  function Example(props) {
    let ref = useRef();
    let {breadcrumbProps} = useBreadcrumbs(props, {}, ref);
    return <div ref={ref} {...breadcrumbProps} data-testid="test">{props.children}</div>;
  }

  it('handles defaults', function () {
    let res = render(<Example />);
    let el = res.getByTestId('test');
    expect(el).toHaveAttribute('aria-label', 'Breadcrumbs');
    expect(el.id).toBeDefined();
  });

  it('handles custom aria label', function () {
    let res = render(<Example aria-label="test-label" />);
    let el = res.getByTestId('test');
    expect(el).toHaveAttribute('aria-label', 'test-label');
    expect(el.id).toBeDefined();
  });
});
