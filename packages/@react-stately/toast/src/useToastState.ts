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

  const onRemove = (ref) => {
    console.log('ref', ref);
    console.log('toasts', toasts);
    // let tempToasts = [...toasts].filter(item => item.props.ref.current === ref.current);
    let tempToasts = [...toasts].filter(item => item.props === {});
    console.log('onRemove post filter', tempToasts);
    setToasts(tempToasts);
  };

  return {
    onAdd,
    onRemove,
    setToasts,
    toasts
  };
}
