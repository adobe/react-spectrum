'use client';
import {
  Switch as AriaSwitch,
  SwitchProps as AriaSwitchProps
} from 'react-aria-components';

import './Switch.css';

export interface SwitchProps extends Omit<AriaSwitchProps, 'children'> {
  children: React.ReactNode;
}

export function Switch({ children, ...props }: SwitchProps) {
  return (
    <AriaSwitch {...props}>
      {({isSelected, isDisabled}) => (<>
        <div className="track indicator">
          <div data-disabled={isDisabled || undefined} className={isSelected ? 'handle' : 'handle indicator'} />
        </div>
        {children}
      </>)}
    </AriaSwitch>
  );
}
