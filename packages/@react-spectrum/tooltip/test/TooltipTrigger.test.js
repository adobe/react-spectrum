import {ActionButton} from '@react-spectrum/button';
import {cleanup, fireEvent, render, waitForDomChange, wait} from '@testing-library/react';
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
// instead of worrying about hover check the actual state change ...
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
      triggerHover(button);                                       // is this appropriate way to mock a hover
      // await waitForDomChange(); // wait for animation         // times out

      let tooltip = getByRole('tooltip');  // Unable to find an element with the role "tooltip"
      expect(tooltip).toBeVisible();

    });
*/


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

      // wait for appearance
      await wait(() => {
        expect(tooltip).toBeInTheDocument()
      })
      // ^ passes

      fireEvent.keyDown(button, {key: 'Escape'});
      await waitForDomChange(); // times out ..... does this depend on the delay you set in onHover? This waits for 4500 ms ... you have 500 ms delay

      expect(tooltip).not.toBeInTheDocument();

      // await wait(() => {
      //   expect(tooltip).not.toBeInTheDocument()
      // })

    });




  /*
  // don't worry about browser interaction ... check the state

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
      triggerPress(button);
      triggerHover(button);
      await waitForDomChange(); // wait for animation

      let tooltip = getByRole('tooltip');
      expect(document.activeElement).toBe(tooltip);

      fireEvent.keyDown(tooltip, {key: 'Escape'});
      await waitForDomChange(); // wait for animation
      expect(tooltip).not.toBeInTheDocument();
      expect(document.activeElement).toBe(button);
    });
  */



/*

// the button should aria descibed-by not the tooltip, because the tooltip doesn't have focus
  // should be taken away when tooltip is closed
  // that's something handle in the implementation code, and then come back here
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

    triggerPress(button); // click again
    // await waitForDomChange(); // wait for animation         ... times out

    expect(tooltip).not.toHaveAttribute('aria-describedby', 'foo'); // still has it if don't do waitForDomChange

  });

*/


/*
same thing as above 
  it('should add aria-describedby to trigger when using the tooltip generated id', async function () {
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
    await waitForDomChange(); // wait for animation

    expect(tooltip).not.toHaveAttribute('aria-describedby');    // still has id if don't include waitForDomChange

  });
*/


});
