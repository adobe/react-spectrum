'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {
  useToast,
  useToastRegion,
  type AriaToastProps,
  type AriaToastRegionProps
} from 'react-aria/useToast';
import {useToastState, type ToastState} from 'react-stately/useToastState';
import {Button} from './Button';
import {X} from 'lucide-react';
import {useRef} from 'react';
import {useFocusRing} from 'react-aria/useFocusRing';
import './Toast.css';
import './Button.css';

export interface ToastProviderProps {
  children: (state: ToastState<string>) => React.ReactNode;
}

export function ToastProvider({children}: ToastProviderProps) {
  let state = useToastState<string>({maxVisibleToasts: 5});

  return (
    <>
      {children(state)}
      {state.visibleToasts.length > 0 && <ToastRegion state={state} />}
    </>
  );
}

function ToastRegion({state, ...props}: AriaToastRegionProps & {state: ToastState<string>}) {
  let ref = useRef<HTMLDivElement>(null);
  /*- begin highlight -*/
  let {regionProps} = useToastRegion(props, state, ref);
  /*- end highlight -*/
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

function Toast({state, toast, ...props}: AriaToastProps<string> & {state: ToastState<string>}) {
  let ref = useRef<HTMLDivElement>(null);
  /*- begin highlight -*/
  let {toastProps, contentProps, titleProps, closeButtonProps} = useToast(
    {...props, toast},
    state,
    ref
  );
  /*- end highlight -*/
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
      <Button {...closeButtonProps} slot="close" variant="quiet" aria-label="Close">
        <X size={16} />
      </Button>
    </div>
  );
}

export {Button};
