import {BreadcrumbItem, Breadcrumbs} from '../';
import {cleanup, render} from '@testing-library/react';
import React, {useRef} from 'react';
import V2Breadcrumbs from '@react/react-spectrum/Breadcrumbs';


describe('Breadcrumbs', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name               | Component        | props
    ${'Breadcrumbs'}   | ${Breadcrumbs}   | ${{}}
    ${'V2Breadcrumbs'} | ${V2Breadcrumbs} | ${{}}
  `('$Name handles defaults', function ({Component, props}) {
    let {getByLabelText} = render(<Component {...props} id="breadcrumbs-id" aria-label="breadcrumbs-test" />);

    let breadcrumbs = getByLabelText('breadcrumbs-test');
    expect(breadcrumbs).toHaveAttribute('id', 'breadcrumbs-id');
  });

  // v3 functionality, omitting v2 component
  it('Handles custom class name', () => {
    let {getByTestId} = render(
      <Breadcrumbs className="test-class">
        <BreadcrumbItem>Folder 1</BreadcrumbItem>
      </Breadcrumbs>
    );
    let breadcrumbs = getByTestId('breadcrumb-list');
    expect(breadcrumbs).toHaveAttribute('class', expect.stringContaining('test-class'));
  });

  it('Can forward ref', function () {
    let ref;
    let Component = () => {
      ref = useRef();
      return (
        <Breadcrumbs ref={ref} aria-label="breadcrumbs-test">
          <BreadcrumbItem>Folder 1</BreadcrumbItem>
        </Breadcrumbs>
      );
    };
    let {getByLabelText} = render(<Component />);
    expect(ref.current).toEqual(getByLabelText('breadcrumbs-test'));
  });

  it('Handles custom heading aria level prop', () => {
    let {getByTestId} = render(
      <Breadcrumbs headingAriaLevel={2} size="L">
        <BreadcrumbItem>Folder 1</BreadcrumbItem>
      </Breadcrumbs>
    );
    let breadcrumbs = getByTestId('breadcrumb-heading');
    expect(breadcrumbs).toHaveAttribute('aria-level', '2');
  });
});
