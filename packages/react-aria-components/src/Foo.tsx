import {ContextValue, Button as RACButton, useContextProps} from 'react-aria-components';
import React, {ComponentProps, createContext, JSX} from 'react';

interface StyleProps {
  variant?: 'filled' | 'outlined' | 'ghost'
  intent?: 'neutral' | 'accent' | 'success' | 'warning' | 'critical' | 'info'
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

interface ButtonProps extends ComponentProps<typeof RACButton>, StyleProps {}

const ButtonContext = createContext<ContextValue<Partial<ButtonProps>, HTMLButtonElement>>(null);

export function Button({ref, ...props}: ButtonProps): JSX.Element {
  // TypeScript error: useContextProps expects ForwardedRef but React 19 provides Ref
  [props, ref] = useContextProps(props, ref, ButtonContext);

  // Some code...

  return <RACButton ref={ref} {...props} />;
}
