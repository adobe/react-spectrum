import {cleanup, render} from '@testing-library/react';
import React, {useRef} from 'react';
import V2Well from '@react/react-spectrum/Well';
import {Well} from '../';

let refExists = (ComponentToCheck, children, props) => {
  let ref;
  let dataTestId = props['data-testid'] || 'refTestId';
  let Component = () => {
    ref = useRef();
    return (<ComponentToCheck ref={ref} {...props} data-testid={dataTestId}>{children}</ComponentToCheck>);
  };

  let {getByText, getByTestId} = render(<Component />);
  expect(ref.current).toEqual(getByTestId(dataTestId));

  return {getByText, ref};
};

describe('Well', () => {
  afterEach(function () {
    cleanup();
  });

  it.each`
    Name      | Component   | props
    ${'v3'}   | ${Well}     | ${{UNSAFE_className: 'myClass', 'data-testid': 'wellV3'}}
    ${'v2'}   | ${V2Well}   | ${{className: 'myClass', 'data-testid': 'wellV2'}}
  `('$Name supports UNSAFE_className', ({Component, props}) => {
    let {getByTestId} = render(<Component {...props}>My Well</Component>);
    let className = getByTestId(props['data-testid']).className;
    expect(className.includes('spectrum-Well')).toBeTruthy();
    expect(className.includes('myClass')).toBeTruthy();
  });

  it.each`
    Name      | Component   | props
    ${'v3'}   | ${Well}     | ${{'data-testid': 'wellV3'}}
    ${'v2'}   | ${V2Well}   | ${{'data-testid': 'wellV2'}}
  `('$Name supports additional properties', ({Component, props}) => {
    let {getByTestId} = render(<Component {...props}>My Well</Component>);
    expect(getByTestId(props['data-testid'])).toHaveAttribute('data-testid', props['data-testid']);
  });

  it.each`
    Name      | Component
    ${'v3'}   | ${Well}
    ${'v2'}   | ${V2Well}
  `('$Name supports children', ({Component}) => {
    let {getByText} = render(<Component>My Well</Component>);
    expect(getByText('My Well')).toBeTruthy();
  });

  it('v3 forward ref exists and supports children and props', function () {
    let {ref} = refExists(Well, 'Well Text', {'data-testid': 'wellForwardRef'});
    expect(ref.current).toHaveAttribute('data-testid', 'wellForwardRef');
    expect(ref.current.textContent.includes('Well Text')).toBeTruthy();
  });
});
