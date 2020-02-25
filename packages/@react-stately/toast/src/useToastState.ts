import {ReactNode, useRef, useState} from 'react';
import {SpectrumToastProps, ToastState, ToastStateValue} from '@react-types/toast';

interface ToastStateProps {
  value?: ToastStateValue[]
}

const TOAST_TIMEOUT = 5000;

export function useToastState(props?: ToastStateProps): ToastState {
  const [toasts, setToasts] = useState(props && props.value || []);
  const toastsRef = useRef(toasts);
  toastsRef.current = toasts;

  const onAdd = (content: ReactNode, options: SpectrumToastProps) => {
    let tempToasts = [...toasts];
    let timeoutId: ReturnType<typeof setTimeout>;

    // set timer to remove toasts
    if (!(options.actionLabel || options.timeout === 0)) {
      if (options.timeout < 0) {
        options.timeout = TOAST_TIMEOUT;
      }
      timeoutId = setTimeout(() => onRemove(options.idKey), options.timeout || 5000);
    }

    tempToasts.push({
      content,
      props: options,
      timeoutId
    });
    setToasts(tempToasts);


  };

  const onRemove = (idKey: string) => {
    let tempToasts = [...toastsRef.current].filter(item => {
      if (item.props.idKey === idKey && item.timeoutId) {
        clearTimeout(item.timeoutId);
      }
      return item.props.idKey !== idKey;
    });
    setToasts(tempToasts);
  };

  return {
    onAdd,
    onRemove,
    setToasts,
    toasts
  };
}
