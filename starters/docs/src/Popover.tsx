'use client';
import {
  OverlayArrow,
  Popover as AriaPopover,
  PopoverProps as AriaPopoverProps
} from 'react-aria-components';

import './Popover.css';
import clsx from 'clsx';

export interface PopoverProps extends Omit<AriaPopoverProps, 'children'> {
  children: React.ReactNode;
  hideArrow?: boolean;
  noPadding?: boolean;
}

export function Popover({ children, hideArrow, noPadding, ...props }: PopoverProps) {
  return (
    (
      <AriaPopover {...props} className={clsx("react-aria-Popover react-aria-Dialog", props.className, {
        'dialog-padding': !noPadding
      })}>
        {!hideArrow && (
          <OverlayArrow>
            <svg width={12} height={12} viewBox="0 0 12 12">
              <path d="M0 0 L6 6 L12 0" />
            </svg>
          </OverlayArrow>
        )}
        {children}
      </AriaPopover>
    )
  );
}
