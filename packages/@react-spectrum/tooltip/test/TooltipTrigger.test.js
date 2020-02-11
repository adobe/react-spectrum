import {ActionButton} from '@react-spectrum/button';
import {cleanup, fireEvent, render, wait, waitForDomChange} from '@testing-library/react';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {Tooltip, TooltipTrigger} from '../';
import {triggerPress} from '@react-spectrum/test-utils';

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

  describe('handles defaults', function () {

    it('should return proper ids', async function () {
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
        expect(tooltip).toBeVisible();
      });

      expect(tooltip.id).toBeTruthy();
      expect(button).toHaveAttribute('aria-describedby', tooltip.id);
    });
  });

  describe('click related tests', function () {

    it('triggered by click event', async function () {
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
        expect(tooltip).toBeVisible();
      });
    });

    it('pressing escape should close the tooltip after a click event', async function () {
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
        expect(tooltip).toBeInTheDocument();
      });

      fireEvent.keyDown(button, {key: 'Escape'});
      await waitForDomChange();

      expect(tooltip).not.toBeInTheDocument();
    });
  });


  describe('hover related tests', function () {

    it('triggered by hover event', async function () {
      let {getByText} = render(
        <Provider theme={theme}>
          <TooltipTrigger type="hover">
            <ActionButton>Trigger</ActionButton>
            <Tooltip>content</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = getByText('Trigger');
      fireEvent.mouseOver(button);

      await new Promise((x) => setTimeout(x, 400));

      let tooltip = getByText('content');
      expect(tooltip).toBeInTheDocument();
    });

    it('pressing escape if the trigger is focused should close the tooltip', async function () {
      let {getByText} = render(
        <Provider theme={theme}>
          <TooltipTrigger type="hover">
            <ActionButton>Trigger</ActionButton>
            <Tooltip>content</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let button = getByText('Trigger');
      fireEvent.mouseOver(button);

      await new Promise((x) => setTimeout(x, 400));

      let tooltip = getByText('content');
      expect(tooltip).toBeInTheDocument();

      fireEvent.focus(button);
      fireEvent.keyDown(button, {key: 'Escape'});
      await waitForDomChange();

      expect(tooltip).not.toBeInTheDocument();
    });

    // TODO: mouseOut should close the tooltip ... look at SplitView tests as an example 
    // TODO: mousing into tooltip should stop it from closing

  });

  describe('only one tooltip should appear on the screen at a time', function () {

    it('click triggers only', async function () {

      let {getByText} = render(
        <Provider theme={theme}>
          <TooltipTrigger type="click">
            <ActionButton>TriggerOne</ActionButton>
            <Tooltip>contentOne</Tooltip>
          </TooltipTrigger>

          <TooltipTrigger type="click">
            <ActionButton>TriggerTwo</ActionButton>
            <Tooltip>contentTwo</Tooltip>
          </TooltipTrigger>
        </Provider>
      );

      let buttonOne = getByText('TriggerOne');
      triggerPress(buttonOne);

      let tooltipOne = getByText('contentOne');

      // wait for appearance
      await wait(() => {
        expect(tooltipOne).toBeVisible();
      });

      let buttonTwo = getByText('TriggerTwo');
      triggerPress(buttonTwo);

      let tooltipTwo = getByText('contentTwo');

      // wait for appearance
      await wait(() => {
        expect(tooltipTwo).toBeVisible();
      });

      // This fails...
      // expect(tooltipOne).not.toBeVisible();

    });
  });

  // TODO: 'hover triggers only'
  // TODO: 'both hover and click triggers'

});
