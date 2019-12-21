import {chain} from '@react-aria/utils';
import {createRef, useRef, useState} from 'react';

export function useToastState(value) {
  const [toasts, setToasts] = useState(value);

  const onAdd = (content, options) => {
    let {
      timeout,
      ...otherProps
    } = options;
    let toastRef = createRef();
    console.log('toastRef', toastRef);

    otherProps.onClose = chain(otherProps.onClose, () => onRemove(toastRef));

    toasts.push({
      content,
      props: {
        variant: 'positive',
        ...otherProps
      },
      ref: toastRef
    });
    console.log('tempToasts', toasts);
    setToasts(toasts);
  };

  const onRemove = (toastRef) => {
    console.log('toastRef.current', toastRef.current);
    console.log('toasts before', toasts.length);
    console.log('toasts', toasts);
    let filtered = toasts.filter(t => {
      console.log('t.ref.current.id', t.ref.current.id);
      console.log('toastRef.current.id', toastRef.current.id);
      return t.ref.current.id !== toastRef.current.id;
    });

    console.log('filtered after', filtered.length);
    console.log('toasts after', toasts.length);
    setToasts(filtered);
  };

  return {
    onAdd,
    onRemove,
    toasts,
    setToasts
  };
}
