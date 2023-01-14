import React, {useEffect, useRef} from 'react';
import {
  DismissButton,
  FocusScope,
  mergeProps,
  useDialog,
  useOverlay,
  useOverlayPosition,
  useOverlayTrigger,
  useButton,
} from 'react-aria';
import {useOverlayTriggerState} from 'react-stately';
import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

let index = 0;
export const Popover = ({ children, testId }) => {
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const state = useOverlayTriggerState({});
  const { overlayProps: overlayPositionProps } = useOverlayPosition({
    overlayRef: popoverRef,
    targetRef: triggerRef,
    isOpen: state.isOpen,
  });
  const { triggerProps, overlayProps } = useOverlayTrigger(
    { type: 'dialog' },
    state,
    triggerRef
  );
  let id = useRef(index++);
  console.log('render popover', id.current)
  useEffect(() => {
    console.log('popover effect', id.current)
    return () => {
      console.log('popover unmount', id.current)
    }
  }, []);
  return (
    <>
      <Button data-testid={testId} buttonRef={triggerRef} {...triggerProps}>
        button
      </Button>
      {state.isOpen && (
        <PopoverOverlay
          {...mergeProps(overlayProps, overlayPositionProps)}
          onClose={state.close}
          popoverRef={popoverRef}
        >
          {children}
        </PopoverOverlay>
      )}
    </>
  );
};

const PopoverOverlay = ({ onClose, popoverRef, children, ...otherProps }) => {
  const { overlayProps } = useOverlay(
    {
      isOpen: true,
      onClose,
      isDismissable: true,
    },
    popoverRef
  );
  const { dialogProps } = useDialog({}, popoverRef);
  return (
    // <div
    // /* We need this div because https://github.com/adobe/react-spectrum/issues/3877 */
    // >
    <FocusScope restoreFocus contain>
      <div
        ref={popoverRef}
        {...mergeProps(dialogProps, otherProps, overlayProps)}
      >
        {children}
      </div>
      <DismissButton onDismiss={onClose} />
    </FocusScope>
    // </div>
  );
};

const Button = ({ children, buttonRef, ...props }) => {
  const { buttonProps } = useButton(props, buttonRef);
  return (
    <button {...buttonProps} ref={buttonRef}>
      {children}
    </button>
  );
};

describe('Unmounting cleanup', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    console.log('after all');
    jest.runAllTimers();
  });
  afterEach(() => {
    console.log('after each')
  });

  it('should open nested popover',  () => {
    render(
      <Popover testId="root">
        <Popover testId="nested">
          <div>content</div>
        </Popover>
      </Popover>
    );

    const rootTrigger = screen.getByTestId('root');
    userEvent.click(rootTrigger);

    expect(screen.queryByText('content')).not.toBeInTheDocument();

    const nestedTrigger = screen.getByTestId('nested');
    userEvent.click(nestedTrigger);

    expect(screen.getByText('content')).toBeInTheDocument();
    console.log('test done');
  });
});
