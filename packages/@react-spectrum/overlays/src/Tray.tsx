import {classNames} from '@react-spectrum/utils';
import {Overlay} from './Overlay';
import overrideStyles from './overlays.css';
import React, {ReactElement, useRef} from 'react';
// eslint-disable-next-line monorepo/no-internal-import
import trayStyles from '@spectrum-css/tray/dist/index-vars.css';
import {Underlay} from './Underlay';
import {useModal, useOverlay} from '@react-aria/overlays';

interface TrayProps {
  children: ReactElement,
  isOpen?: boolean,
  onClose?: () => void
}

interface TrayWrapperProps extends TrayProps {
  isOpen?: boolean
}

export function Tray({children, onClose, ...props}: TrayProps) {
  return (
    <Overlay {...props}>
      <Underlay />
      <TrayWrapper onClose={onClose}>
        {children}
      </TrayWrapper>
    </Overlay>
  );
}

function TrayWrapper({children, onClose, isOpen}: TrayWrapperProps) {
  let ref = useRef();
  let {overlayProps} = useOverlay({ref, onClose, isOpen});
  useModal();

  // TODO: android back button?

  let wrapperClassName = classNames(
    trayStyles,
    'spectrum-Tray-wrapper'
  );

  let className = classNames(
    trayStyles,
    'spectrum-Tray',
    {
      'is-open': isOpen
    },
    classNames(
      overrideStyles,
      'spectrum-Tray',
      'react-spectrum-Tray'
    )
  );

  return (
    <div className={wrapperClassName}>
      <div className={className} ref={ref} {...overlayProps} data-testid="tray">
        {children}
      </div>
    </div>
  );
}
