import {ReactNode, useState} from 'react';
import {SpectrumToastProps, ToastState, ToastStateValue} from '@react-types/toast';

interface ToastStateProps {
  value?: ToastStateValue[]
}

export function useToastState(props?: ToastStateProps): ToastState {
  const [toasts, setToasts] = useState(props && props.value || []);

  const onAdd = (content: ReactNode, options: SpectrumToastProps) => {
    let tempToasts = [...toasts];
    tempToasts.push({
      content,
      props: options
    });
    setToasts(tempToasts);
  };

  const onRemove = (idKey: string) => {
    let tempToasts = [...toasts].filter(item => item.props.idKey !== idKey);
    setToasts(tempToasts);
  };

  return {
    onAdd,
    onRemove,
    setToasts,
    toasts
  };
}
