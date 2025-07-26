'use client';
import {
  OverlayArrow,
  Popover as AriaPopover,
  PopoverProps as AriaPopoverProps
} from 'react-aria-components';
import clsx from 'clsx';

import './Popover.css';

export interface PopoverProps extends Omit<AriaPopoverProps, 'children'> {
  children: React.ReactNode;
  hideArrow?: boolean;
}

export function Popover({ children, hideArrow, ...props }: PopoverProps) {
  return (
    (
      <AriaPopover {...props} className={clsx("react-aria-Popover", props.className)}>
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
