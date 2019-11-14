import {ActionButton} from '@react-spectrum/button';
import {cleanup, fireEvent, render, waitForDomChange} from '@testing-library/react';
import {Tooltip, TooltipTrigger} from '../';
import React from 'react';
import {triggerPress} from '@react-spectrum/test-utils';
import {triggerHover} from '@react-spectrum/test-utils';

// add the test for esc button after animation loads as well 
describe('TooltipTrigger', function () {
  afterEach(cleanup);

  it('triggered by click event', function () {
    let {getByRole, getByTestId} = render(
        <TooltipTrigger type="click">
          <ActionButton>Trigger</ActionButton>
          <Tooltip>contents</Tooltip>
        </TooltipTrigger>
    );

    expect(() => {
      getByRole('tooltip');
    }).toThrow();

    let button = getByRole('button');
    triggerPress(button);

    let tooltip = getByRole('tooltip');
    expect(tooltip).toBeVisible();

  });


  it('triggered by hover event', function () {
    let {getByRole, getByTestId} = render(
        <TooltipTrigger type="hover">
          <ActionButton>Trigger</ActionButton>
          <Tooltip>contents</Tooltip>
        </TooltipTrigger>
    );

    expect(() => {
      getByRole('tooltip');
    }).toThrow();

    let button = getByRole('button');
    triggerHover(button);

    let tooltip = getByRole('tooltip');
    expect(tooltip).toBeVisible();

  });

});
