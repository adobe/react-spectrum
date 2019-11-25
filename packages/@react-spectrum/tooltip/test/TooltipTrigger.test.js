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

  it('triggered by click event', function () {
    let {getByRole} = render(
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
      expect(tooltip).toBeInTheDocument();
    });

    fireEvent.keyDown(button, {key: 'Escape'});
    await waitForDomChange();

    expect(tooltip).not.toBeInTheDocument();

  });

});
