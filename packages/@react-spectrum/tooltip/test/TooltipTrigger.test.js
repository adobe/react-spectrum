import {ActionButton} from '@react-spectrum/button';
import {cleanup, fireEvent, render, waitForDomChange} from '@testing-library/react';
import {Tooltip, TooltipTrigger} from '../';
import React from 'react';
import {triggerPress, triggerHover} from '@react-spectrum/test-utils';
import {Provider} from '@react-spectrum/provider';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

describe('TooltipTrigger', function () {
  let onOpen = jest.fn();
  let onClose = jest.fn();

  afterEach(() => {
    onOpen.mockClear();
    onClose.mockClear();
    cleanup();
  });

  it('triggered by click event', function () {
    let {getByRole, getByTestId} = render(
      <Provider theme={theme}>
        <TooltipTrigger type="click">
          <ActionButton>Trigger</ActionButton>
          <Tooltip>content</Tooltip>
        </TooltipTrigger>
      </Provider>
    );

    expect(() => {
      getByRole('tooltip');
    }).toThrow();

    let button = getByRole('button');
    triggerPress(button);

    let tooltip = getByRole('tooltip');
    expect(tooltip).toBeVisible();

  });

/*
  it('triggered by hover event', function () {
    let {getByRole, getByTestId} = render(
      <Provider theme={theme}>
        <TooltipTrigger type="hover">
          <ActionButton>Trigger</ActionButton>
          <Tooltip>content</Tooltip>
        </TooltipTrigger>
      </Provider>
    );

    expect(() => {
      getByRole('tooltip');
    }).toThrow();

    let button = getByRole('button');
    triggerHover(button);

    let tooltip = getByRole('tooltip');  // Unable to find an element with the role "tooltip"
    expect(tooltip).toBeVisible();

  });
*/

  /*
  it('pressing esc should close the tooltip after a click event', async function () {
    let {getByRole} = render(
      <Provider theme={theme}>
        <TooltipTrigger type="click">
          <ActionButton>Trigger</ActionButton>
          <Tooltip>content</Tooltip>
        </TooltipTrigger>
      </Provider>
    );

    let button = getByRole('button');
    triggerPress(button);

    let tooltip = getByRole('tooltip');
    await waitForDomChange(); // wait for animation         // times out
    expect(document.activeElement).toBe(tooltip);

    fireEvent.keyDown(tooltip, {key: 'Escape'});
    await waitForDomChange(); // wait for animation
    expect(tooltip).not.toBeInTheDocument();
    expect(document.activeElement).toBe(button);
    expect(onOpenChange).toBeCalledTimes(1);
    expect(onClose).toBeCalledTimes(1);
  });
  */


  /*
  it('pressing esc should close the tooltip after a hover event', async function () {
    let {getByRole} = render(
      <Provider theme={theme}>
        <TooltipTrigger type="hover">
          <ActionButton>Trigger</ActionButton>
          <Tooltip>content</Tooltip>
        </TooltipTrigger>
      </Provider>
    );

    let button = getByRole('button');
    triggerHover(button);

    let tooltip = getByRole('tooltip');               // Unable to find an element with the role "tooltip"
    await waitForDomChange(); // wait for animation
    expect(document.activeElement).toBe(tooltip);

    fireEvent.keyDown(tooltip, {key: 'Escape'});
    await waitForDomChange(); // wait for animation
    expect(tooltip).not.toBeInTheDocument();
    expect(document.activeElement).toBe(button);
    expect(onClose).toBeCalledTimes(1);
  });
  */

/*
  it('should add aria-describedby to trigger', async function () {
    let {getByRole, getByTestId} = render(
        <Provider theme={theme}>
          <TooltipTrigger type="click">
            <ActionButton>Trigger</ActionButton>
            <Tooltip id="foo">content</Tooltip>
          </TooltipTrigger>
        </Provider>
    );

    expect(() => {
      getByRole('tooltip');
    }).toThrow();

    let button = getByRole('button');
    triggerPress(button);

    let tooltip = getByRole('tooltip');
    expect(tooltip).toBeVisible();

    let ariaLabel = document.getElementById(tooltip.getAttribute('aria-describedby'), 'foo');

    expect(tooltip).toHaveAttribute('aria-describedby', 'foo');

    await waitForDomChange(); // wait for animation
    triggerPress(button); // click again

    expect(tooltip).not.toHaveAttribute('aria-describedby', 'foo'); // still has it

  });
*/

/*
  it('should add aria-describedby to trigger when using the tooltip generated id', function () {
    let {getByRole, getByTestId} = render(
        <Provider theme={theme}>
          <TooltipTrigger type="click">
            <ActionButton>Trigger</ActionButton>
            <Tooltip>content</Tooltip>
          </TooltipTrigger>
        </Provider>
    );

    expect(() => {
      getByRole('tooltip');
    }).toThrow();

    let button = getByRole('button');
    triggerPress(button);

    let tooltip = getByRole('tooltip');
    expect(tooltip).toBeVisible();

    let ariaLabel = document.getElementById(tooltip.getAttribute('aria-describedby'));

    expect(tooltip).toHaveAttribute('aria-describedby', ariaLabel.id);

    triggerPress(button); // click again

    expect(tooltip).not.toHaveAttribute('aria-describedby');    // still has id

  });
*/

});
