import {ActionButton, ButtonGroup} from '../';
import {cleanup, render} from '@testing-library/react';
import React, {useRef} from 'react';
import V2ButtonGroup from '@react/react-spectrum/ButtonGroup';

describe('ButtonGroup', function () {
  afterEach(() => {
    cleanup();
  });

  it.each`
  Name               | Component        | props
  ${'ButtonGroup'}   | ${ButtonGroup}   | ${{}}
  ${'V2ButtonGroup'} | ${V2ButtonGroup} | ${{}}
  `('$Name handles defaults', function ({Component, props}) {
    let {getByTestId} = render(
      <Component {...props} data-testid="test-group">
        <ActionButton data-testid="test-button" >Click me</ActionButton>
      </Component>
    );
    let group = getByTestId('test-group');
    expect(group).toHaveAttribute('role', 'radiogroup');
    let button = getByTestId('test-button');
    expect(button).toHaveAttribute('role', 'radio');
  });

  it.each`
  Name               | Component        | props
  ${'ButtonGroup'}   | ${ButtonGroup}   | ${{allowsMultipleSelection: true}}
  ${'V2ButtonGroup'} | ${V2ButtonGroup} | ${{multiple: true, role: 'toolbar'}}
  `('$Name handles multiple selection', function ({Component, props}) {
    let {getByTestId} = render(
      <Component {...props} data-testid="test-group">
        <ActionButton data-testid="test-button" >Click me</ActionButton>
        <ActionButton >Click me</ActionButton>
      </Component>
    );
    let group = getByTestId('test-group');
    expect(group).toHaveAttribute('role', 'toolbar');
    let button = getByTestId('test-button');
    expect(button).toHaveAttribute('role', 'checkbox');
  });

  it.each`
    Name               | Component        | props
    ${'ButtonGroup'}   | ${ButtonGroup}   | ${{orientation: 'vertical'}}
    ${'V2ButtonGroup'} | ${V2ButtonGroup} | ${{orientation: 'vertical', role: 'toolbar'}}
  `('$Name handles vertical', function ({Component, props}) {
    let {getByTestId} = render(
      <Component {...props} data-testid="test-group" >
        <ActionButton>Click me</ActionButton>
      </Component>
    );
    let group = getByTestId('test-group');
    expect(group).toHaveAttribute('aria-orientation', 'vertical');
  });

  it.each`
    Name               | Component        | props
    ${'ButtonGroup'}   | ${ButtonGroup}   | ${{isDisabled: true}}
    ${'V2ButtonGroup'} | ${V2ButtonGroup} | ${{disabled: true}}
  `('$Name handles disabeld', function ({Component, props}) {
    let {getByTestId} = render(
      <Component {...props} data-testid="test-group" >
        <ActionButton>Click me</ActionButton>
      </Component>
    );
    let group = getByTestId('test-group');
    expect(group).toHaveAttribute('aria-disabled', 'true');
  });

  // v3 functionality
  it('v3 handles ref', function () {
    let ref;
    let Component = () => {
      ref = useRef();
      return (
        <ButtonGroup ref={ref} data-testid="test-group" >
          <ActionButton>Click me</ActionButton>
        </ButtonGroup>
      );
    };
    let {getByTestId} = render(<Component />);
    expect(ref.current).toEqual(getByTestId('test-group'));
  });
});
