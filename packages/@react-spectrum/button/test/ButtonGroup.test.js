import {ActionButton, ButtonGroup} from '../';
import {cleanup, render} from '@testing-library/react';
import React from 'react';
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
    let {getByRole, getAllByRole} = render(
      <Component {...props}>
        <ActionButton >Click me</ActionButton>
      </Component>
    );
    expect(getByRole('radiogroup')).toBeTruthy();
    expect(getAllByRole('radio')).toBeTruthy();
  });

  it.each`
  Name               | Component        | props
  ${'ButtonGroup'}   | ${ButtonGroup}   | ${{selectionMode: 'multiple'}}
  ${'V2ButtonGroup'} | ${V2ButtonGroup} | ${{multiple: true, role: 'toolbar'}}
  `('$Name handles multiple selection', function ({Component, props}) {
    let {getByRole, getAllByRole} = render(
      <Component {...props} >
        <ActionButton >Click me</ActionButton>
        <ActionButton >Click me</ActionButton>
      </Component>
    );
    expect(getByRole('toolbar')).toBeTruthy();
    let button = getAllByRole('checkbox');
    expect(button.length).toBe(2);
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
    let {getByRole} = render(
      <Component {...props} >
        <ActionButton>Click me</ActionButton>
      </Component>
    );
    let group = getByRole('radiogroup');
    expect(group).toHaveAttribute('aria-disabled', 'true');
  });
});
