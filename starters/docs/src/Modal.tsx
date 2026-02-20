'use client';
import {Modal as RACModal, ModalOverlayProps} from 'react-aria-components';
import './Modal.css';

export function Modal(props: ModalOverlayProps) {
  return <RACModal {...props} />;
}
