import {ActionButton, ButtonGroup} from '../';
import {cleanup, render} from '@testing-library/react';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import V2ButtonGroup from '@react/react-spectrum/ButtonGroup';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

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
      <Provider theme={theme} locale="de-DE">
        <Component {...props}>
          <ActionButton >Click me</ActionButton>
        </Component>
      </Provider>
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
      <Provider theme={theme} locale="de-DE">
        <Component {...props} >
          <ActionButton >Click me</ActionButton>
          <ActionButton >Click me</ActionButton>
        </Component>
      </Provider>
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
      <Provider theme={theme} locale="de-DE">
        <Component {...props} data-testid="test-group" >
          <ActionButton>Click me</ActionButton>
        </Component>
      </Provider>
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
      <Provider theme={theme} locale="de-DE">
        <Component {...props} >
          <ActionButton>Click me</ActionButton>
        </Component>
      </Provider>
    );
    let group = getByRole('radiogroup');
    expect(group).toHaveAttribute('aria-disabled', 'true');
  });
});
