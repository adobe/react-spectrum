import {Modal as RACModal, ModalOverlay, ModalOverlayProps} from 'react-aria-components';
import React from 'react';

export function Modal(props: ModalOverlayProps) {
  return (
    <ModalOverlay
      {...props}
      className={({ isEntering, isExiting }) => `
      fixed top-0 left-0 w-full h-[--visual-viewport-height] isolate z-20 bg-black/[15%] flex items-center justify-center p-4 text-center backdrop-blur-lg
      ${isEntering ? 'animate-in fade-in duration-200 ease-out' : ''}
      ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
    `}>
      <RACModal
        {...props}
        className={({ isEntering, isExiting }) => `
        w-full max-w-md max-h-full overflow-auto rounded-2xl bg-white p-6 text-left align-middle shadow-2xl ring-1 ring-black/10
        ${isEntering ? 'animate-in zoom-in-105 ease-out duration-200' : ''}
        ${isExiting ? 'animate-out zoom-out-95 ease-in duration-200' : ''}
      `}
      />
    </ModalOverlay>
  );
}
