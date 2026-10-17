/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, fireEvent, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {Button} from '../src/Button';
import {ComboBox} from '../src/ComboBox';
import {Dialog, DialogTrigger} from '../src/Dialog';
import {Input} from '../src/Input';
import {ListBox, ListBoxItem} from '../src/ListBox';
import {Menu, MenuItem, MenuTrigger, SubmenuTrigger} from '../src/Menu';
import {Modal} from '../src/Modal';
import {OverlayArrow} from '../src/OverlayArrow';
import {Popover, PopoverOverlay} from '../src/Popover';
import {Pressable} from 'react-aria/Pressable';
import React, {useRef} from 'react';
import {Select, SelectValue} from '../src/Select';
import {UNSAFE_PortalProvider} from 'react-aria/PortalProvider';
import userEvent from '@testing-library/user-event';

let TestPopover = props => (
  <DialogTrigger>
    <Button />
    <Popover {...props}>
      <OverlayArrow>
        <svg width={12} height={12}>
          <path d="M0 0,L6 6,L12 0" />
        </svg>
      </OverlayArrow>
      <Dialog>Popover</Dialog>
    </Popover>
  </DialogTrigger>
);

describe('Popover', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });
  afterEach(() => {
    act(() => jest.runAllTimers());
  });

  it('works with a dialog', async () => {
    let {getByRole, queryByRole} = render(<TestPopover />);

    let button = getByRole('button');
    expect(queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(button);

    let dialog = getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog.closest('.react-aria-Popover')).toHaveAttribute('data-trigger', 'DialogTrigger');

    expect(button).toHaveAttribute('aria-controls');
    expect(dialog).toHaveAttribute('id', button.getAttribute('aria-controls'));

    await user.click(document.body);

    expect(dialog).not.toBeInTheDocument();
  });

  it('applies overlay id to standalone popover', async () => {
    let {getByRole} = render(
      <DialogTrigger>
        <Button />
        <Popover aria-label="Popover">Popover content</Popover>
      </DialogTrigger>
    );

    let button = getByRole('button');
    await user.click(button);

    let dialog = getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-controls');
    expect(dialog).toHaveAttribute('id', button.getAttribute('aria-controls'));
  });

  it('should handle focus', async () => {
    let {getByRole} = render(<TestPopover />);

    let button = getByRole('button');

    await user.tab();
    expect(button).toHaveFocus();

    await user.click(button);

    let dialog = getByRole('dialog');
    expect(dialog).toHaveFocus();

    await user.click(document.body);
    act(() => jest.runAllTimers());

    expect(button).toHaveFocus();
  });

  it('should support render props', async () => {
    let {getByRole} = render(
      <DialogTrigger>
        <Button />
        <Popover placement="bottom start">
          {({placement}) => <Dialog>Popover at {placement}</Dialog>}
        </Popover>
      </DialogTrigger>
    );

    let button = getByRole('button');

    await user.click(button);

    let dialog = getByRole('dialog');
    expect(dialog).toHaveTextContent('Popover at bottom');
  });

  it('should support custom render function', async () => {
    let {getByRole} = render(
      <TestPopover render={props => <div {...props} data-custom="true" />} />
    );
    let button = getByRole('button');
    await user.click(button);
    let dialog = getByRole('dialog').parentElement;
    expect(dialog).toHaveAttribute('data-custom', 'true');
  });

  it('should support being used standalone', () => {
    let triggerRef = React.createRef();
    let onOpenChange = jest.fn();
    let {getByRole} = render(
      <>
        <span ref={triggerRef}>Trigger</span>
        <Popover isOpen triggerRef={triggerRef} onOpenChange={onOpenChange}>
          <Dialog aria-label="Popover">A popover</Dialog>
        </Popover>
      </>
    );

    let dialog = getByRole('dialog');
    expect(dialog).toHaveTextContent('A popover');

    // userEvent seems to trigger a double close event
    fireEvent.mouseDown(document.body, {button: 0});
    fireEvent.mouseUp(document.body, {button: 0});
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should not leak PopoverContext to nested popovers', () => {
    function NestedPopover() {
      let triggerRef = useRef(null);
      return (
        <>
          <button ref={triggerRef}>anchor</button>
          <Popover triggerRef={triggerRef} isOpen isNonModal data-testid="nested">
            {({trigger}) => `nested trigger=${String(trigger)}`}
          </Popover>
        </>
      );
    }

    let {getByTestId} = render(
      <Select aria-label="Select" defaultOpen>
        <Button>
          <SelectValue />
        </Button>
        <Popover data-testid="outer">
          <ListBox>
            <ListBoxItem id="a">a</ListBoxItem>
          </ListBox>
          <NestedPopover />
        </Popover>
      </Select>
    );

    expect(getByTestId('outer')).toHaveAttribute('data-trigger', 'Select');
    let nested = getByTestId('nested');
    expect(nested).toHaveTextContent('nested trigger=null');
    expect(nested).not.toHaveAttribute('data-trigger');
    expect(nested).not.toHaveAttribute('aria-labelledby');
  });

  it('isOpen and defaultOpen should override state from context', () => {
    let onOpenChange = jest.fn();
    let {getByRole} = render(
      <>
        <DialogTrigger>
          <Button />
          <Popover isOpen onOpenChange={onOpenChange}>
            <Dialog>A popover</Dialog>
          </Popover>
        </DialogTrigger>
      </>
    );

    let dialog = getByRole('dialog');
    expect(dialog).toHaveTextContent('A popover');

    // userEvent seems to trigger a double close event
    fireEvent.mouseDown(document.body, {button: 0});
    fireEvent.mouseUp(document.body, {button: 0});
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('supports isEntering and isExiting props', async () => {
    let {getByRole, rerender} = render(<TestPopover isEntering />);

    let button = getByRole('button');
    await user.click(button);

    let popover = getByRole('dialog').closest('.react-aria-Popover');
    expect(popover).toHaveAttribute('data-entering');

    rerender(<TestPopover />);
    expect(popover).not.toHaveAttribute('data-entering');

    rerender(<TestPopover isExiting />);
    await user.click(button);

    expect(popover).toBeInTheDocument();
    expect(popover).toHaveAttribute('data-exiting');

    rerender(<TestPopover />);
    expect(popover).not.toBeInTheDocument();
  });

  it('supports overriding styles', async () => {
    let {getByRole, getByTestId} = render(
      <DialogTrigger>
        <Button />
        <Popover style={{zIndex: 5}}>
          <OverlayArrow style={{top: 5}} data-testid="arrow">
            <svg width={12} height={12}>
              <path d="M0 0,L6 6,L12 0" />
            </svg>
          </OverlayArrow>
          <Dialog>Popover</Dialog>
        </Popover>
      </DialogTrigger>
    );

    let button = getByRole('button');
    await user.click(button);

    let popover = getByRole('dialog').closest('.react-aria-Popover');
    expect(popover).toHaveAttribute('style', expect.stringContaining('z-index: 5'));
    let arrow = getByTestId('arrow');
    expect(arrow).toHaveAttribute('style', expect.stringContaining('top: 5px'));
  });

  describe('portalProvider', () => {
    function InfoPopover() {
      return (
        <DialogTrigger>
          <Button />
          <Popover>
            <OverlayArrow>
              <svg width={12} height={12}>
                <path d="M0 0,L6 6,L12 0" />
              </svg>
            </OverlayArrow>
            <Dialog>Popover</Dialog>
          </Popover>
        </DialogTrigger>
      );
    }
    function App() {
      let container = useRef(null);
      return (
        <>
          <UNSAFE_PortalProvider getContainer={() => container.current}>
            <InfoPopover container={container} />
          </UNSAFE_PortalProvider>
          <div ref={container} data-testid="custom-container" />
        </>
      );
    }
    it('should render the dialog in the portal container set by the PortalProvider', async () => {
      let {getByRole, getByTestId} = render(<App />);

      let button = getByRole('button');
      await user.click(button);

      expect(getByRole('dialog').closest('[data-testid="custom-container"]')).toBe(
        getByTestId('custom-container')
      );
    });
  });

  // TODO: delete this test when we get rid of the deprecated prop
  describe('portalContainer', () => {
    function InfoPopover(props) {
      return (
        <DialogTrigger>
          <Button />
          <Popover UNSTABLE_portalContainer={props.container}>
            <OverlayArrow>
              <svg width={12} height={12}>
                <path d="M0 0,L6 6,L12 0" />
              </svg>
            </OverlayArrow>
            <Dialog>Popover</Dialog>
          </Popover>
        </DialogTrigger>
      );
    }
    function App() {
      let [container, setContainer] = React.useState();
      return (
        <>
          <InfoPopover container={container} />
          <div ref={setContainer} data-testid="custom-container" />
        </>
      );
    }
    it('should render the dialog in the portal container', async () => {
      let {getByRole, getByTestId} = render(<App />);

      let button = getByRole('button');
      await user.click(button);

      expect(getByRole('dialog').closest('[data-testid="custom-container"]')).toBe(
        getByTestId('custom-container')
      );
    });
  });

  it('should support custom Pressable trigger', async () => {
    let {getByRole} = render(
      <DialogTrigger>
        <Pressable>
          <span role="button">Trigger</span>
        </Pressable>
        <Popover>
          <Dialog>Popover</Dialog>
        </Popover>
      </DialogTrigger>
    );

    let button = getByRole('button');

    await user.click(button);

    let dialog = getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });
});

describe('PopoverOverlay', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => jest.runAllTimers());
  });

  function Example({overlayProps, popoverProps, ...triggerProps}) {
    return (
      <DialogTrigger {...triggerProps}>
        <Button>Open popover</Button>
        <PopoverOverlay {...overlayProps}>
          <Popover {...popoverProps}>
            <Dialog>Popover content</Dialog>
          </Popover>
        </PopoverOverlay>
      </DialogTrigger>
    );
  }

  it('keeps the default underlay when no custom overlay is provided', async () => {
    let {getByRole, getByTestId} = render(<TestPopover />);
    await user.click(getByRole('button'));
    expect(getByTestId('underlay')).toHaveStyle({position: 'fixed', inset: 0});
    expect(document.querySelector('.react-aria-PopoverOverlay')).toBeNull();
  });

  it('renders a single custom underlay and forwards its ref and DOM props', async () => {
    let ref = React.createRef();
    let {getByRole, queryByTestId} = render(
      <Example
        overlayProps={{ref, 'data-testid': 'backdrop', id: 'backdrop', style: {zIndex: 10}}}
      />
    );
    expect(ref.current).toBeNull();
    await user.click(getByRole('button', {name: 'Open popover'}));
    expect(ref.current).toBe(queryByTestId('backdrop'));
    expect(ref.current).toHaveAttribute('id', 'backdrop');
    expect(ref.current).toHaveClass('react-aria-PopoverOverlay');
    expect(ref.current).toHaveStyle({position: 'fixed', inset: 0, zIndex: 10});
    expect(queryByTestId('underlay')).toBeNull();
    expect(document.querySelectorAll('.react-aria-PopoverOverlay')).toHaveLength(1);
    expect(ref.current).not.toContainElement(getByRole('dialog'));
  });

  it('supports className, style, and DOM render functions', async () => {
    let className = jest.fn(
      ({isEntering, isExiting, state}) =>
        `${state.isOpen ? 'open' : 'closed'} ${isEntering ? 'entering' : ''} ${isExiting ? 'exiting' : ''}`
    );
    let {getByRole, getByTestId} = render(
      <Example
        overlayProps={{
          isEntering: true,
          className,
          style: ({defaultStyle, isEntering}) => ({...defaultStyle, zIndex: isEntering ? 10 : 5}),
          render: props => <div {...props} data-testid="custom" />
        }}
      />
    );
    await user.click(getByRole('button'));
    let overlay = getByTestId('custom');
    expect(overlay).toHaveClass('open', 'entering');
    expect(overlay).toHaveStyle({zIndex: 10, position: 'fixed', inset: 0});
    expect(overlay).toHaveAttribute('data-entering');
    expect(className).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isEntering: true,
        isExiting: false,
        state: expect.objectContaining({isOpen: true})
      })
    );
    expect(overlay).toBeEmptyDOMElement();
  });

  it.each(['mouse', 'touch', 'keyboard'])(
    'dismisses with %s and restores focus',
    async interaction => {
      let onOpenChange = jest.fn();
      let {getByRole, getByTestId, queryByRole} = render(
        <Example onOpenChange={onOpenChange} overlayProps={{'data-testid': 'backdrop'}} />
      );
      let button = getByRole('button');
      await user.click(button);
      expect(getByRole('dialog')).toHaveFocus();
      onOpenChange.mockClear();
      if (interaction === 'keyboard') {
        await user.keyboard('{Escape}');
      } else if (interaction === 'touch') {
        await user.pointer({target: getByTestId('backdrop'), keys: '[TouchA]'});
      } else {
        await user.click(getByTestId('backdrop'));
      }
      act(() => jest.runAllTimers());
      expect(queryByRole('dialog')).toBeNull();
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(button).toHaveFocus();
    }
  );

  it('keeps dismissal options on the Popover', async () => {
    let shouldCloseOnInteractOutside = jest.fn(() => false);
    let {getByRole, getByTestId} = render(
      <Example
        overlayProps={{'data-testid': 'backdrop'}}
        popoverProps={{isKeyboardDismissDisabled: true, shouldCloseOnInteractOutside}}
      />
    );
    await user.click(getByRole('button'));
    let dialog = getByRole('dialog');
    await user.keyboard('{Escape}');
    expect(dialog).toBeInTheDocument();
    await user.click(getByTestId('backdrop'));
    expect(dialog).toBeInTheDocument();
    expect(shouldCloseOnInteractOutside).toHaveBeenCalledWith(getByTestId('backdrop'));
  });

  it.each(['controlled', 'uncontrolled'])('supports %s state on the overlay', async mode => {
    let onOpenChange = jest.fn();
    let props = mode === 'controlled' ? {isOpen: true} : {defaultOpen: true};
    let {getByRole, queryByRole, rerender} = render(
      <Example overlayProps={{...props, onOpenChange}} />
    );
    expect(getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    if (mode === 'controlled') {
      expect(getByRole('dialog')).toBeInTheDocument();
      rerender(<Example overlayProps={{isOpen: false, onOpenChange}} />);
    }
    expect(queryByRole('dialog')).toBeNull();
  });

  it('keeps onOpenChange on the trigger when using its state', async () => {
    let warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    let onTriggerChange = jest.fn();
    let onOverlayChange = jest.fn();
    try {
      let {getByRole} = render(
        <Example onOpenChange={onTriggerChange} overlayProps={{onOpenChange: onOverlayChange}} />
      );
      await user.click(getByRole('button'));
      expect(onTriggerChange).toHaveBeenCalledWith(true);
      expect(onOverlayChange).not.toHaveBeenCalled();
      expect(warn).toHaveBeenCalledWith(
        "This popover's state is controlled by a trigger, place onOpenChange on the trigger instead."
      );
    } finally {
      warn.mockRestore();
    }
  });

  it.each([
    ['Select', Select],
    ['ComboBox', ComboBox]
  ])('lets controlled overlay state override %s state', async (_, Trigger) => {
    let onOpenChange = jest.fn();
    let onTriggerChange = jest.fn();
    let ref = React.createRef();
    function ControlledExample({isOpen}) {
      return (
        <Trigger aria-label="Animal" onOpenChange={onTriggerChange}>
          {Trigger === ComboBox && <Input />}
          <Button>Open animals</Button>
          <PopoverOverlay isOpen={isOpen} onOpenChange={onOpenChange} ref={ref}>
            <Popover>
              <ListBox>
                <ListBoxItem id="cat">Cat</ListBoxItem>
              </ListBox>
            </Popover>
          </PopoverOverlay>
        </Trigger>
      );
    }
    let {getByRole, queryByRole, rerender} = render(<ControlledExample isOpen />);
    expect(getByRole('listbox')).toBeInTheDocument();
    if (Trigger === Select) {
      expect(ref.current).toHaveClass('react-aria-PopoverOverlay');
    } else {
      expect(ref.current).toBeNull();
    }
    rerender(<ControlledExample isOpen={false} />);
    expect(queryByRole('listbox')).toBeNull();
    expect(ref.current).toBeNull();
    expect(onTriggerChange).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('preserves standalone Popover state and positioning props', async () => {
    let triggerRef = React.createRef();
    let {getByRole, queryByRole} = render(
      <>
        <button ref={triggerRef}>Anchor</button>
        <PopoverOverlay>
          <Popover triggerRef={triggerRef} defaultOpen placement="top" aria-label="Standalone">
            Standalone content
          </Popover>
        </PopoverOverlay>
      </>
    );
    expect(getByRole('dialog')).toHaveAttribute('data-placement', 'top');
    await user.keyboard('{Escape}');
    expect(queryByRole('dialog')).toBeNull();
  });

  it('supports externally controlled entry and exit animations', async () => {
    let {getByRole, getByTestId, queryByRole, rerender} = render(
      <Example overlayProps={{'data-testid': 'backdrop', isEntering: true}} />
    );
    await user.click(getByRole('button'));
    let overlay = getByTestId('backdrop');
    expect(overlay).toHaveAttribute('data-entering');
    rerender(<Example overlayProps={{'data-testid': 'backdrop', isExiting: true}} />);
    await user.keyboard('{Escape}');
    expect(overlay).toHaveAttribute('data-exiting');
    expect(getByRole('dialog').closest('.react-aria-Popover')).toHaveAttribute('data-exiting');
    rerender(<Example overlayProps={{'data-testid': 'backdrop'}} />);
    expect(overlay).not.toBeInTheDocument();
    expect(queryByRole('dialog')).toBeNull();
  });

  it.each(['overlay', 'popover'])(
    'honors explicit %s exit state even when automatic animation is skipped',
    async source => {
      let {getByRole, getByTestId, rerender} = render(
        <Example
          defaultOpen
          overlayProps={{'data-testid': 'backdrop', isExiting: source === 'overlay'}}
          popoverProps={{shouldSkipAnimation: true, isExiting: source === 'popover'}}
        />
      );
      await user.keyboard('{Escape}');
      let overlay = getByTestId('backdrop');
      expect(overlay).toHaveAttribute('data-exiting');
      expect(getByRole('dialog')).toBeInTheDocument();
      rerender(<Example popoverProps={{shouldSkipAnimation: true}} />);
      expect(overlay).not.toBeInTheDocument();
    }
  );

  it('uses the same portal container for the popover and custom overlay', async () => {
    function PortalExample() {
      let container = useRef(null);
      return (
        <>
          <UNSAFE_PortalProvider getContainer={() => container.current}>
            <Example overlayProps={{'data-testid': 'backdrop'}} />
          </UNSAFE_PortalProvider>
          <div ref={container} data-testid="portal" />
        </>
      );
    }
    let {getByRole, getByTestId} = render(<PortalExample />);
    await user.click(getByRole('button'));
    let portal = getByTestId('portal');
    expect(portal).toContainElement(getByTestId('backdrop'));
    expect(portal).toContainElement(getByRole('dialog'));
  });

  it('does not leak overlay customization to nested popovers', async () => {
    let {getByRole, queryByTestId} = render(
      <DialogTrigger>
        <Button>Outer</Button>
        <PopoverOverlay data-testid="outer-backdrop">
          <Popover aria-label="Outer popover">
            <DialogTrigger>
              <Button>Inner</Button>
              <Popover aria-label="Inner popover">Inner content</Popover>
            </DialogTrigger>
          </Popover>
        </PopoverOverlay>
      </DialogTrigger>
    );
    await user.click(getByRole('button', {name: 'Outer'}));
    let outer = queryByTestId('outer-backdrop');
    await user.click(getByRole('button', {name: 'Inner'}));
    expect(queryByTestId('underlay')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-testid="outer-backdrop"]')).toHaveLength(1);
    await user.keyboard('{Escape}');
    expect(queryByTestId('underlay')).toBeNull();
    expect(outer).toBeInTheDocument();
    expect(getByRole('dialog', {name: 'Outer'})).toBeInTheDocument();
  });

  it('preserves Select collection building through the overlay wrapper', async () => {
    let {getByRole, getAllByRole, queryByRole} = render(
      <Select aria-label="Favorite animal">
        <Button>
          <SelectValue />
        </Button>
        <PopoverOverlay>
          <Popover>
            <ListBox>
              <ListBoxItem id="cat">Cat</ListBoxItem>
              <ListBoxItem id="dog">Dog</ListBoxItem>
            </ListBox>
          </Popover>
        </PopoverOverlay>
      </Select>
    );
    let button = getByRole('button');
    await user.click(button);
    expect(getAllByRole('option')).toHaveLength(2);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    await user.click(getByRole('option', {name: 'Dog'}));
    expect(button).toHaveTextContent('Dog');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(queryByRole('listbox')).toBeNull();
    act(() => jest.runAllTimers());
    expect(button).toHaveFocus();
  });

  it('does not add a blocking overlay to a non-modal ComboBox', async () => {
    let {getByRole, queryByTestId} = render(
      <ComboBox aria-label="Favorite animal">
        <Input />
        <Button>Open animals</Button>
        <PopoverOverlay data-testid="backdrop">
          <Popover>
            <ListBox>
              <ListBoxItem id="cat">Cat</ListBoxItem>
              <ListBoxItem id="dog">Dog</ListBoxItem>
            </ListBox>
          </Popover>
        </PopoverOverlay>
      </ComboBox>
    );
    await user.click(getByRole('button', {name: 'Show suggestions'}));
    expect(queryByTestId('backdrop')).toBeNull();
    expect(getByRole('combobox')).toHaveFocus();
    await user.click(getByRole('option', {name: 'Dog'}));
    expect(getByRole('combobox')).toHaveValue('Dog');
  });

  it('shares one overlay with submenus inside a modal', async () => {
    let onAction = jest.fn();
    let {getByRole, getAllByRole, getByTestId, queryByTestId} = render(
      <Modal isOpen>
        <Dialog aria-label="Modal">
          <MenuTrigger>
            <Button>Menu</Button>
            <PopoverOverlay data-testid="backdrop" style={{zIndex: 100}}>
              <Popover>
                <Menu>
                  <SubmenuTrigger>
                    <MenuItem>Share</MenuItem>
                    <Popover>
                      <Menu onAction={onAction}>
                        <MenuItem id="email">Email</MenuItem>
                      </Menu>
                    </Popover>
                  </SubmenuTrigger>
                </Menu>
              </Popover>
            </PopoverOverlay>
          </MenuTrigger>
        </Dialog>
      </Modal>
    );
    let button = getByRole('button', {name: 'Menu'});
    await user.click(button);
    await user.pointer({target: getByRole('menuitem', {name: 'Share'})});
    act(() => jest.runAllTimers());
    expect(getAllByRole('menu')).toHaveLength(2);
    expect(document.querySelectorAll('[data-testid="backdrop"]')).toHaveLength(1);
    expect(queryByTestId('underlay')).toBeNull();
    let popovers = document.querySelectorAll('.react-aria-Popover');
    expect(popovers[0].parentElement).toBe(popovers[1].parentElement);
    await user.click(getByRole('menuitem', {name: 'Email'}));
    expect(onAction).toHaveBeenCalledWith('email', undefined);
    expect(queryByTestId('backdrop')).toBeNull();
    act(() => jest.runAllTimers());
    expect(button).toHaveFocus();
    expect(getByRole('dialog', {name: 'Modal'})).toBeInTheDocument();
    await user.click(button);
    await user.click(getByTestId('backdrop'));
    expect(queryByTestId('backdrop')).toBeNull();
    expect(getByRole('dialog', {name: 'Modal'})).toBeInTheDocument();
  });
});
