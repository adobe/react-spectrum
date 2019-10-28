import {BreadcrumbItem} from '../';
import {cleanup, fireEvent, render} from '@testing-library/react';
import React, {useRef} from 'react';

export function triggerPress(element) {
  fireEvent.mouseDown(element);
  fireEvent.mouseUp(element);
  fireEvent.click(element);
}

// v3 component
describe('Breadcrumbs', function () {

  afterEach(() => {
    cleanup();
  });

  it('Handles defaults', () => {
    let {getByText} = render(<BreadcrumbItem >Breadcrumb item</BreadcrumbItem>);
    let breadcrumbItem = getByText('Breadcrumb item');
    expect(breadcrumbItem.id).toBeDefined();
    expect(breadcrumbItem.tabIndex).toBe(0);
  });

  it('Handles current', () => {
    let {getByText} = render(<BreadcrumbItem isCurrent >Breadcrumb item</BreadcrumbItem>);
    let breadcrumbItem = getByText('Breadcrumb item');
    expect(breadcrumbItem.tabIndex).toBe(-1);
    expect(breadcrumbItem).toHaveAttribute('aria-current', 'page');
  });

  it('Handles onPress', () => {
    let onPressSpy = jest.fn();
    let {getByText} = render(<BreadcrumbItem onPress={onPressSpy} >Breadcrumb item</BreadcrumbItem>);
    let breadcrumbItem = getByText('Breadcrumb item');
    triggerPress(breadcrumbItem);
    expect(onPressSpy).toHaveBeenCalledTimes(1);
  });

  it('Handles custom class name', () => {
    let {getByText} = render(<BreadcrumbItem className="test-class" >Breadcrumb item</BreadcrumbItem>);
    let breadcrumbItem = getByText('Breadcrumb item');
    expect(breadcrumbItem).toHaveAttribute('class', expect.stringContaining('test-class'));
  });

  it('Can forward ref', function () {
    let ref;
    let Component = () => {
      ref = useRef();
      return <BreadcrumbItem ref={ref}>Breadcrumb item</BreadcrumbItem>;
    };
    let {getByText} = render(<Component />);
    expect(ref.current).toEqual(getByText('Breadcrumb item'));
  });
});
