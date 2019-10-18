import {cleanup, render} from '@testing-library/react';
import {fireEvent} from '@testing-library/react';
import {Link} from '../';
import React from 'react';
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
});
