import {
  fireEvent,
  installMouseEvent,
  installPointerEvent,
  render
} from '@react-spectrum/test-utils-internal';
import {mergeProps} from '../../src/utils/mergeProps';
import React, {useRef} from 'react';
import {useModalOverlay} from '../../src/overlays/useModalOverlay';
import {useOverlayTriggerState} from 'react-stately/useOverlayTriggerState';

function Example(props) {
  let ref = useRef();
  let state = useOverlayTriggerState(props);
  let {modalProps, underlayProps} = useModalOverlay(props, state, ref);
  return (
    <div {...mergeProps(underlayProps, props.underlayProps || {})}>
      <div ref={ref} {...modalProps} data-testid={props['data-testid'] || 'test'}>
        {props.children}
      </div>
    </div>
  );
}

describe('useModalOverlay', function () {
  describe.each`
    type                | prepare                | actions
    ${'Mouse Events'}   | ${installMouseEvent}   | ${[el => fireEvent.mouseDown(el, {button: 0}), el => fireEvent.mouseUp(el, {button: 0})]}
    ${'Pointer Events'} | ${installPointerEvent} | ${[el => fireEvent.pointerDown(el, {button: 0, pointerId: 1}), el => fireEvent.pointerUp(el, {button: 0, pointerId: 1})]}
    ${'Touch Events'}   | ${() => {}}            | ${[el => fireEvent.touchStart(el, {changedTouches: [{identifier: 1}]}), el => fireEvent.touchEnd(el, {changedTouches: [{identifier: 1}]})]}
  `('$type', ({actions: [pressStart, pressEnd], prepare}) => {
    prepare();

    it('should hide the overlay when clicking outside if shouldCloseOnInteractOutside returns true', function () {
      let onOpenChange = jest.fn();
      render(
        <Example
          isOpen
          onOpenChange={onOpenChange}
          isDismissable
          shouldCloseOnInteractOutside={target => target === document.body}
        />
      );
      pressStart(document.body);
      pressEnd(document.body);
      fireEvent.click(document.body);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should not hide the overlay when clicking outside if shouldCloseOnInteractOutside returns false', function () {
      let onOpenChange = jest.fn();
      render(
        <Example
          isOpen
          onOpenChange={onOpenChange}
          isDismissable
          shouldCloseOnInteractOutside={target => target !== document.body}
        />
      );
      pressStart(document.body);
      pressEnd(document.body);
      fireEvent.click(document.body);
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('should not hide the overlay when a press is retargeted to the document element', function () {
      // When the pressed element is removed from the DOM mid-press (e.g. a button swapped
      // out after an async mutation), the browser retargets the press events to the
      // document element. That must not be treated as a press outside the modal.
      let onOpenChange = jest.fn();
      render(
        <Example
          isOpen
          onOpenChange={onOpenChange}
          isDismissable />
      );
      pressStart(document.documentElement);
      pressEnd(document.documentElement);
      fireEvent.click(document.documentElement);
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('should ignore a retargeted press even if shouldCloseOnInteractOutside returns true', function () {
      let onOpenChange = jest.fn();
      render(
        <Example
          isOpen
          onOpenChange={onOpenChange}
          isDismissable
          shouldCloseOnInteractOutside={() => true}
        />
      );
      pressStart(document.documentElement);
      pressEnd(document.documentElement);
      fireEvent.click(document.documentElement);
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });
});
