import React from 'react';
import {act} from 'react-test-renderer';
import {fireEvent, renderWithProvider} from '../../test-utils/renderWithProvider';
import {ToastContainer, ToastQueue} from './Toast';

function findAlerts(root: any) {
  return root.findAll(
    (n: any) =>
      typeof n.type === 'string' && n.props && n.props.accessibilityRole === 'alert'
  );
}

describe('ToastQueue', () => {
  beforeEach(() => {
    ToastQueue.clear();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('adds and renders toast in container', () => {
    let {root} = renderWithProvider(<ToastContainer />);
    act(() => {
      ToastQueue.positive('Saved', {duration: 0});
    });
    let alerts = findAlerts(root);
    expect(alerts.length).toBe(1);
    let label = root.findAll(
      (n: any) => typeof n.type === 'string' && n.props && n.props.children === 'Saved'
    )[0];
    expect(label).toBeDefined();
  });

  it('auto-dismisses after duration', () => {
    let {root} = renderWithProvider(<ToastContainer />);
    act(() => {
      ToastQueue.info('Hi', {duration: 1000});
    });
    expect(findAlerts(root).length).toBe(1);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(findAlerts(root).length).toBe(0);
  });

  it('fires onAction and closes when action pressed', () => {
    let onAction = jest.fn();
    let {root} = renderWithProvider(<ToastContainer />);
    act(() => {
      ToastQueue.neutral('Undo me?', {actionLabel: 'Undo', duration: 0, onAction});
    });
    let actionBtn = root
      .findAll(
        (n: any) => typeof n.type === 'string' && n.props && n.props.accessibilityRole === 'button'
      )
      .find((p: any) =>
        p
          .findAll(
            (c: any) => typeof c.type === 'string' && c.props && c.props.children === 'Undo'
          )
          .length > 0
      );
    expect(actionBtn).toBeDefined();
    act(() => {
      actionBtn!.props.onPress();
    });
    expect(onAction).toHaveBeenCalled();
    expect(findAlerts(root).length).toBe(0);
  });
});
