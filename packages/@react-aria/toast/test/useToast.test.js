import {renderHook} from 'react-hooks-testing-library';
import {useToast} from '../';

describe('useToast', () => {
  let onClose = jest.fn();
  let onAction = jest.fn();

  afterEach(() => {
    onClose.mockClear();
    onAction.mockClear();
  });

  let renderToastHook = (props) => {
    let {result} = renderHook(() => useToast(props));
    return result.current;
  };

  it('handles defaults', function () {
    let {actionButtonProps, closeButtonProps, iconProps, toastProps} = renderToastHook({});

    expect(toastProps.role).toBe('alert');
    expect(iconProps.alt).toBe(undefined);
    expect(typeof actionButtonProps.onPress).toBe('function');
    expect(closeButtonProps['aria-label']).toBe('Close');
    expect(closeButtonProps.onPress).toBe(undefined);
  });

  it('variant sets icon alt property', function () {
    let {iconProps} = renderToastHook({variant: 'info'});

    expect(iconProps.alt).toBe('Info');
  });

  it('handles onClose', function () {
    let {closeButtonProps} = renderToastHook({onClose});
    closeButtonProps.onPress();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('handles shouldCloseOnAction', function () {
    let {actionButtonProps} = renderToastHook({onClose, onAction, shouldCloseOnAction: true});
    actionButtonProps.onPress();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
