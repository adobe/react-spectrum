import {ActionButton} from '@react-spectrum/button';
import {cleanup, fireEvent, render, waitForDomChange} from '@testing-library/react';
import {Tooltip, TooltipTrigger} from '../';
import React from 'react';
import {triggerPress} from '@react-spectrum/test-utils';
import {triggerHover} from '@react-spectrum/test-utils';
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

    let tooltip = getByRole('tooltip');
    expect(tooltip).toBeVisible();

  });


  it('pressing esc should close the tooltip after a click event', async function () {
    let {getByRole} = render(
      <TooltipTrigger type="click">
        <ActionButton>Trigger</ActionButton>
        <Tooltip>{content}</Tooltip>
      </TooltipTrigger>
    );

    let button = getByRole('button');
    triggerPress(button);

    let tooltip = getByRole('tooltip');
    await waitForDomChange(); // wait for animation
    expect(document.activeElement).toBe(tooltip);

    fireEvent.keyDown(tooltip, {key: 'Escape'});
    await waitForDomChange(); // wait for animation
    expect(tooltip).not.toBeInTheDocument();
    expect(document.activeElement).toBe(button);
    expect(onClose).toBeCalledTimes(1);
  });

  it('pressing esc should close the tooltip after a hover event', async function () {
    let {getByRole} = render(
      <TooltipTrigger type="hover">
        <ActionButton>Trigger</ActionButton>
        <Tooltip>{content}</Tooltip>
      </TooltipTrigger>
    );

    let button = getByRole('button');
    triggerPress(button);

    let tooltip = getByRole('tooltip');
    await waitForDomChange(); // wait for animation
    expect(document.activeElement).toBe(tooltip);

    fireEvent.keyDown(tooltip, {key: 'Escape'});
    await waitForDomChange(); // wait for animation
    expect(tooltip).not.toBeInTheDocument();
    expect(document.activeElement).toBe(button);
    expect(onClose).toBeCalledTimes(1);
  });

  it('opens using keyboard event, ArrowDown + Alt', () => {
    let {getByRole} = render(
      <TooltipTrigger type="click">
        <ActionButton>Trigger</ActionButton>
        <Tooltip>{content}</Tooltip>
      </TooltipTrigger>
    );

    let button = getByRole('button');
    triggerPress(button);

    fireEvent.keyDown(tooltip, {key: 'ArrowDown', altKey: true});
    await waitForDomChange(); // wait for animation
    expect(tooltip).toBeInTheDocument();
    expect(document.activeElement).toBe(button);
    expect(onOpen).toBeCalledTimes(1);
  });

  it('opens using keyboard event, Down + Alt', () => {
    let {getByRole} = render(
      <TooltipTrigger type="click">
        <ActionButton>Trigger</ActionButton>
        <Tooltip>{content}</Tooltip>
      </TooltipTrigger>
    );

    let button = getByRole('button');
    triggerPress(button);

    fireEvent.keyDown(tooltip, {key: 'ArrowDown', altKey: true});
    await waitForDomChange(); // wait for animation
    expect(tooltip).toBeInTheDocument();
    expect(document.activeElement).toBe(button);
    expect(onOpen).toBeCalledTimes(1);
  });


  it('should add aria-describedby to trigger', function () {
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

    expect(tooltip).not.toHaveAttribute('aria-describedby');

  });


  it('should add aria-describedby to trigger when using the tooltip generated id', function () {
    let {getByRole, getByTestId} = render(
        <TooltipTrigger type="click">
          <ActionButton>Trigger</ActionButton>
          <Tooltip>content</Tooltip>
        </TooltipTrigger>
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

    expect(tooltip).not.toHaveAttribute('aria-describedby');

  });

  it('disabled prop should hide overlay', () => {
    tree = mount(
      <OverlayTrigger trigger="click">
        <Button>Click me</Button>
        <Popover>Popover</Popover>
      </OverlayTrigger>
    );

    tree.find(Button).simulate('click');
    assert(tree.state('show'));
    tree.setProps({disabled: true});
    assert(!tree.state('show'));
  });

  it.each`
    Name             | Component      | props
    ${'TooltipTrigger'} | ${TooltipTrigger} | ${{disabled: true}}
  `('$Name does not open when disabled prop is ultized', async function ({Component, props}) {
    let tree = render(Component, props);

    let button = tree.getByRole('button');
    triggerPress(button);
    await waitForDomChange();

    let tooltip = tree.getByRole('tooltip');
    expect(tooltip).toBeFalsy();
  });
  */

});
