import React from 'react';
import type {ReactNode} from 'react';
import {View, type ViewProps} from 'react-native';
import {cn} from '../styles/cn';

const UniwindView = View as React.ComponentType<ViewProps & {className?: string}>;

export interface OverlayProps extends Pick<ViewProps, 'accessibilityViewIsModal' | 'pointerEvents'> {
  children?: ReactNode;
  className?: string;
}

export function Overlay({
  accessibilityViewIsModal,
  children,
  className,
  pointerEvents = 'box-none'
}: OverlayProps) {
  return (
    <UniwindView
      accessibilityViewIsModal={accessibilityViewIsModal}
      className={cn('absolute bottom-0 left-0 right-0 top-0 z-50', className)}
      pointerEvents={pointerEvents}>
      {children}
    </UniwindView>
  );
}
