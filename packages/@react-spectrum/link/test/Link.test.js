import {cleanup, fireEvent, render} from '@testing-library/react';
import {Link} from '../';
import React, {useRef} from 'react';
import V2Link from '@react/react-spectrum/Link';

// Triggers a "press" event on an element.
// TODO: import from somewhere more common
export function triggerPress(element) {
  fireEvent.mouseDown(element);
  fireEvent.mouseUp(element);
  fireEvent.click(element);
}

describe('Link', function () {
  let onPressSpy = jest.fn();

  afterEach(() => {
    cleanup();
    onPressSpy.mockClear();
  });

  it.each`
    Name        | Component | props
    ${'Link'}   | ${Link}   | ${{onPress: onPressSpy}}
    ${'V2Link'} | ${V2Link} | ${{onClick: onPressSpy}}
  `('$Name handles defaults', function ({Component, props}) {
    let {getByText} = render(<Component {...props} >Click me</Component>);
 
    let link = getByText('Click me');
    expect(link).not.toBeNull();

    triggerPress(link);
    expect(onPressSpy).toHaveBeenCalledTimes(1);
  });

  it.each`
    Name        | Component | props
    ${'Link'}   | ${Link}   | ${{UNSAFE_className: 'test-class'}}
    ${'V2Link'} | ${V2Link} | ${{className: 'test-class'}}
  `('$Name supports UNSAFE_className', function ({Component, props}) {
    let {getByText} = render(<Component {...props} >Click me</Component>);
    let link = getByText('Click me');
    expect(link).toHaveAttribute('class', expect.stringContaining('test-class'));
  });

  // New v3 functionality, omitting v2 component
  // V3 will clone custom child element and map the class/event handlers
  it('Wraps string to span', () => {
    let {getByRole} = render(<Link >Click me</Link>);
    let link = getByRole('link');
    expect(link).toBeDefined();
    expect(link.nodeName).toBe('SPAN');
  });

  it('Wraps custom child element', () => {
    let {getByRole} = render(
      <Link UNSAFE_className="test-class" onPress={onPressSpy} >
        <a href="http://example.com" >Click me </a>
      </Link>
    );
    let link = getByRole('link');
    expect(link).toBeDefined();
    expect(link.nodeName).toBe('A');
    expect(link).toHaveAttribute('class', expect.stringContaining('test-class'));
    triggerPress(link);
    expect(onPressSpy).toHaveBeenCalledTimes(1);
  });

  it('Handles deprecated onClick', () => {
    let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    let {getByRole} = render(<Link onClick={onPressSpy} >Click me</Link>);
    let link = getByRole('link');
    triggerPress(link);
    expect(onPressSpy).toHaveBeenCalledTimes(1);
    expect(spyWarn).toHaveBeenCalledWith('onClick is deprecated, please use onPress');
  });

  it('v3 can forward ref', function () {
    let ref;
    let Component = () => {
      ref = useRef();
      return <Link ref={ref} >Click me</Link>;
    };
    let {getByRole} = render(<Component />);
    expect(ref.current).toEqual(getByRole('link'));
  });

});
