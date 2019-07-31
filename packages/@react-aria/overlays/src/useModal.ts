import {useEffect} from 'react';

export function useModal() {
  // Add overflow: hidden to the body on mount, and restore on unmount.
  useEffect(() => {
    let overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);
}
