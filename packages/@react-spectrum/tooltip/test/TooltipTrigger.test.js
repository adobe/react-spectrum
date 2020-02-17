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

  function renderClickTrigger() {
    return render(
      <Provider theme={theme}>
        <TooltipTrigger type="click">
          <ActionButton>Trigger</ActionButton>
          <Tooltip>content</Tooltip>
        </TooltipTrigger>
      </Provider>
    );
  }

  describe('click related tests', function () {

    function verifyClickTriggerToggle() {
      jest.useFakeTimers();
      let tree = renderClickTrigger();
      let triggerButton = tree.getByRole('button');

      triggerPress(triggerButton);

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 200);
      jest.runAllTimers();

      let tooltip = tree.getByRole('tooltip');
      expect(tooltip).toBeTruthy();

      triggerPress(triggerButton);

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 200);
      jest.runAllTimers();

      expect(tooltip).not.toBeInTheDocument();
    }

    it('a click event can open the tooltip', async function () {
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

    it.each`
      Name             | Component
      ${'TooltipTrigger'} | ${TooltipTrigger}
    `('$Name toggles the tooltip on click events', function () {
      verifyClickTriggerToggle();
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

  describe('focus related tests', function () {

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

      await new Promise((a) => setTimeout(a, 300));

      let tooltip = getByText('content');
      expect(tooltip).toBeInTheDocument();

      fireEvent.focus(button);
      fireEvent.keyDown(button, {key: 'Escape'});
      await waitForDomChange();

      expect(tooltip).not.toBeInTheDocument();
    });
  });

  function renderHoverTrigger() {
    return render(
      <Provider theme={theme}>
        <TooltipTrigger type="hover">
          <ActionButton>Trigger</ActionButton>
          <Tooltip>content</Tooltip>
        </TooltipTrigger>
      </Provider>
    );
  }

  describe('hover related tests', function () {

    function verifyHoverTriggerToggle() {
      jest.useFakeTimers();
      let tree = renderHoverTrigger();
      let triggerButton = tree.getByRole('button');

      fireEvent.mouseOver(triggerButton);

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 200);
      jest.runAllTimers();

      let tooltip = tree.getByRole('tooltip');
      expect(tooltip).toBeTruthy();

      fireEvent.mouseOut(triggerButton);

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 200);
      jest.runAllTimers();

      expect(tooltip).not.toBeInTheDocument();
    }

    it('triggered by mouseOver event', async function () {
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

      await new Promise((b) => setTimeout(b, 400));

      let tooltip = getByText('content');
      expect(tooltip).toBeInTheDocument();
    });

    it.each`
      Name             | Component
      ${'TooltipTrigger'} | ${TooltipTrigger}
    `('$Name toggles the tooltip on mouseOver and mouseOut events', function () {
      verifyHoverTriggerToggle();
    });
  });
});
