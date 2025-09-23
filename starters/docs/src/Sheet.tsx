'use client';
import {Modal, ModalOverlay, ModalOverlayProps, composeRenderProps} from 'react-aria-components';
import {Dialog} from './Dialog';
import './Sheet.css';

export function Sheet(props: ModalOverlayProps) {
  return (
    <ModalOverlay className="sheet-overlay">
      {composeRenderProps(props.children, children => (
        <Modal className="sheet">
          <Dialog>
            {children}
          </Dialog>
        </Modal>
      ))}
    </ModalOverlay>
  );
}
