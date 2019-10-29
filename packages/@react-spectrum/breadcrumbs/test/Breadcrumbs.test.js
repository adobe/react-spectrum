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

  it('Handles multiple items', () => {
    let {getByTestId} = render(
      <Breadcrumbs className="test-class">
        <BreadcrumbItem data-testid="item-1" >Folder 1</BreadcrumbItem>
        <BreadcrumbItem data-testid="item-2" >Folder 2</BreadcrumbItem>
        <BreadcrumbItem data-testid="item-3" >Folder 3</BreadcrumbItem>
      </Breadcrumbs>
    );
    let item1 = getByTestId('item-1');
    expect(item1.tabIndex).toBe(0);
    expect(item1).not.toHaveAttribute('aria-current');
    let item2 = getByTestId('item-2');
    expect(item2.tabIndex).toBe(0);
    expect(item2).not.toHaveAttribute('aria-current');
    let item3 = getByTestId('item-3');
    expect(item3.tabIndex).toBe(-1);
    expect(item3).toHaveAttribute('aria-current', 'page');
  });

  it('Handles multiple items with size L', () => {
    let {getByTestId} = render(
      <Breadcrumbs size="L">
        <BreadcrumbItem>Folder 1</BreadcrumbItem>
        <BreadcrumbItem>Folder 2</BreadcrumbItem>
      </Breadcrumbs>
    );
    let item = getByTestId('breadcrumb-heading');
    expect(item).toBeDefined();
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
