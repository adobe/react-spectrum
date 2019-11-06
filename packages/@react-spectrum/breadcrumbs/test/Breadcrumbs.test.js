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

  it('Should handle forward ref', function () {
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
    let breadcrumb = getByLabelText('breadcrumbs-test');
    expect(breadcrumb).toBe(ref.current);
  });

  it('Handles heading child and headingAriaLevel', () => {
    let {getByTestId} = render(
      <Breadcrumbs headingAriaLevel={2} size="L">
        <BreadcrumbItem>Folder 1</BreadcrumbItem>
      </Breadcrumbs>
    );
    let list = getByTestId('breadcrumb-list');
    let heading = list.children[0].children[0];
    expect(heading.nodeName).toBe('H1');
    expect(heading).toHaveAttribute('aria-level', '2');
  });

  it('Handles max visible items', () => {
    let {getByTestId} = render(
      <Breadcrumbs maxVisibleItems="3" >
        <BreadcrumbItem >Folder 1</BreadcrumbItem>
        <BreadcrumbItem >Folder 2</BreadcrumbItem>
        <BreadcrumbItem >Folder 3</BreadcrumbItem>
        <BreadcrumbItem >Folder 4</BreadcrumbItem>
        <BreadcrumbItem >Folder 5</BreadcrumbItem>
      </Breadcrumbs>
    );
    let {children} = getByTestId('breadcrumb-list');
    expect(children.length).toBe(3);
    expect(children[0].children[0].nodeName).toBe('BUTTON');
    expect(children[1].children[0].textContent).toBe('Folder 4');
    expect(children[2].children[0].textContent).toBe('Folder 5');
  });

  it('Handles max visible items with showRoot', () => {
    let {getByTestId} = render(
      <Breadcrumbs maxVisibleItems="3" showRoot>
        <BreadcrumbItem >Folder 1</BreadcrumbItem>
        <BreadcrumbItem >Folder 2</BreadcrumbItem>
        <BreadcrumbItem >Folder 3</BreadcrumbItem>
        <BreadcrumbItem >Folder 4</BreadcrumbItem>
        <BreadcrumbItem >Folder 5</BreadcrumbItem>
      </Breadcrumbs>
    );
    let {children} = getByTestId('breadcrumb-list');
    expect(children.length).toBe(3);
    expect(children[0].children[0].textContent).toBe('Folder 1');
    expect(children[1].children[0].nodeName).toBe('BUTTON');
    expect(children[2].children[0].textContent).toBe('Folder 5');
  });

  it('Handles isDisabled', () => {
    let {getByTestId} = render(
      <Breadcrumbs isDisabled>
        <BreadcrumbItem data-testid="item-1" >Folder 1</BreadcrumbItem>
        <BreadcrumbItem data-testid="item-2" >Folder 2</BreadcrumbItem>
      </Breadcrumbs>
    );
    let item1 = getByTestId('item-1');
    expect(item1).toHaveAttribute('aria-disabled', 'true');
    let item2 = getByTestId('item-2');
    expect(item2).toHaveAttribute('aria-disabled', 'true');
  });

});
