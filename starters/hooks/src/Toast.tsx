'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {useButton, type AriaButtonProps} from 'react-aria/useButton';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {
  useToast,
  useToastRegion,
  type AriaToastProps,
  type AriaToastRegionProps
} from 'react-aria/useToast';
import {useToastState} from 'react-stately/useToastState';
import {X} from 'lucide-react';
import {useRef} from 'react';
import {Button} from './Button';
import './Toast.css';
import './Button.css';

export function ToastProvider({
  children
}: {
  children: (state: ReturnType<typeof useToastState<string>>) => React.ReactNode;
}) {
  // useToastState manages the queue of visible toasts.
  let state = useToastState<string>({maxVisibleToasts: 5});

  return (
    <>
      {children(state)}
      {state.visibleToasts.length > 0 && <ToastRegion state={state} />}
    </>
  );
}

function ToastRegion({
  state,
  ...props
}: AriaToastRegionProps & {state: ReturnType<typeof useToastState<string>>}) {
  // useToastRegion creates an ARIA landmark so users can navigate to the toasts.
  let ref = useRef<HTMLDivElement>(null);
  let {regionProps} = useToastRegion(props, state, ref);
  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <div
      {...mergeProps(regionProps, focusProps)}
      ref={ref}
      className="react-aria-ToastRegion"
      data-focus-visible={isFocusVisible || undefined}>
      {state.visibleToasts.map(toast => (
        <Toast key={toast.key} toast={toast} state={state} />
      ))}
    </div>
  );
}

function Toast({
  state,
  toast,
  ...props
}: AriaToastProps<string> & {state: ReturnType<typeof useToastState<string>>}) {
  // useToast provides the props for an individual toast and its close button.
  let ref = useRef<HTMLDivElement>(null);
  let {toastProps, contentProps, titleProps, closeButtonProps} = useToast(
    {...props, toast},
    state,
    ref
  );
  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <div
      {...mergeProps(toastProps, focusProps)}
      ref={ref}
      className="react-aria-Toast"
      data-focus-visible={isFocusVisible || undefined}>
      <div {...contentProps} className="react-aria-ToastContent">
        <div {...titleProps} slot="title">
          {toast.content}
        </div>
      </div>
      <CloseButton {...closeButtonProps}>
        <X size={16} />
      </CloseButton>
    </div>
  );
}

function CloseButton(props: AriaButtonProps) {
  let ref = useRef<HTMLButtonElement>(null);
  // useButton turns the AriaButtonProps from useToast into DOM props for the close button.
  let {buttonProps, isPressed} = useButton(props, ref);
  let {hoverProps, isHovered} = useHover(props);
  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <button
      {...mergeProps(buttonProps, hoverProps, focusProps)}
      ref={ref}
      className="react-aria-Button"
      slot="close"
      data-pressed={isPressed || undefined}
      data-hovered={isHovered || undefined}
      data-focus-visible={isFocusVisible || undefined}>
      {props.children}
    </button>
  );
}

export {Button};
