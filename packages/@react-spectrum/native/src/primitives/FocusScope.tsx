import React from 'react';
import type {ReactNode} from 'react';

export interface FocusScopeProps {
  autoFocus?: boolean;
  children?: ReactNode;
  contain?: boolean;
  restoreFocus?: boolean;
}

export function FocusScope({children}: FocusScopeProps) {
  return <>{children}</>;
}
