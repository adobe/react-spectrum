import {classNames} from '@react-spectrum/utils';
import modalStyles from '@adobe/spectrum-css-temp/components/modal/vars.css';
import {Overlay} from './Overlay';
import overrideStyles from './overlays.css';
import React, {ReactElement, useRef} from 'react';
import {Underlay} from './Underlay';
import {useModal, useOverlay} from '@react-aria/overlays';

interface ModalProps {
  children: ReactElement,
  isOpen?: boolean,
  onClose?: () => void
}

interface ModalWrapperProps extends ModalProps {
  isOpen?: boolean
}

export function Modal({children, onClose, ...props}: ModalProps) {
  return (
    <Overlay {...props}>
      <Underlay />
      <ModalWrapper onClose={onClose}>
        {children}
      </ModalWrapper>
    </Overlay>
  );
}

function ModalWrapper({children, onClose, isOpen}: ModalWrapperProps) {
  let ref = useRef(null);
  let {overlayProps} = useOverlay({ref, onClose, isOpen});
  useModal();

  let wrapperClassName = classNames(
    modalStyles,
    'spectrum-Modal-wrapper',
    classNames(
      overrideStyles,
      'spectrum-Modal-wrapper',
      'react-spectrum-Modal-wrapper'
    )
  );

  let modalClassName = classNames(
    modalStyles,
    'spectrum-Modal',
    {
      'is-open': isOpen
    },
    classNames(
      overrideStyles,
      'spectrum-Modal',
      'react-spectrum-Modal'
    )
  );

  return (
    <div className={wrapperClassName}>
      <div
        {...overlayProps}
        ref={ref}
        className={modalClassName}
        data-testid="modal">
        {children}
      </div>
    </div>
  );
}
