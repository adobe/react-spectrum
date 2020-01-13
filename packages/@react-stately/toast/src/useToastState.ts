import {useState} from 'react';

export function useToastState(value) {
  const [toasts, setToasts] = useState(value);

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
