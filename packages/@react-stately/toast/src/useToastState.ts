import {ToastStateBase} from '@react-types/toast';
import {useState} from 'react';


interface ToastStateProps extends React.HTMLAttributes<HTMLElement> {
  value?: ToastStateBase[]
}

export function useToastState(props?: ToastStateProps) {
  const [toasts, setToasts] = useState(props && props.value || []);

  const onAdd = (content, options) => {
    let tempToasts = [...toasts];
    tempToasts.push({
      content,
      props: options
    });
    setToasts(tempToasts);
  };

  return {
    onAdd,
    toasts,
    setToasts
  };
}
