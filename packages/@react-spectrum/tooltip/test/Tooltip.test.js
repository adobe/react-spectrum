import {cleanup, render} from '@testing-library/react';
import React from 'react';
import {Tooltip} from '../';


let testId = 'test-id';

function renderComponent(Component, props, message) {
  return render(<Component {...props} data-testid={testId}>{message}</Component>);
}


// don't test classNames anymore ...
// get rid of classname tests
describe('Tooltip', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name      | Component
    ${'Tooltip'}   | ${Tooltip}
  `('$Name supports children', ({Component}) => {
    let {getByText} = render(<Component>This is a tooltip</Component>);
    expect(getByText('This is a tooltip')).toBeTruthy();
  });

  it.each`
    Name           | Component    | props                  | message
    ${'Tooltip'}   | ${Tooltip}   | ${{className: 'foo'}}  | ${'This is a tooltip'}
  `('$Name supports additional classNames', function ({Component, props, message}) {
    let {getByTestId} = renderComponent(Component, props, message);
    let className = getByTestId(testId).className;
    expect(className.includes('spectrum-Tooltip')).toBeTruthy();
    expect(className.includes('foo')).toBeTruthy();
  });

  it.each`
    Name           | Component    | props
    ${'Tooltip'}   | ${Tooltip}   | ${{variant: 'info'}}
  `('$Name supports different variants', function ({Component, props}) {
    let {getByTestId} = renderComponent(Component, props);
    let className = getByTestId(testId).className;
    expect(className.includes('spectrum-Tooltip--info')).toBeTruthy();
  });

  it.each`
    Name           | Component    | props
    ${'Tooltip'}   | ${Tooltip}   | ${{placement: 'top'}}
  `('$Name supports different placements', function ({Component, props}) {
    let {getByTestId} = renderComponent(Component, props);
    let className = getByTestId(testId).className;
    expect(className.includes('spectrum-Tooltip--top')).toBeTruthy();
  });

});
