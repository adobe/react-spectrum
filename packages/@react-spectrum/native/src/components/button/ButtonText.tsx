import React, {createContext, forwardRef, useContext} from 'react';
import {Text as NativeText} from '../../primitives';
import {cn} from '../../styles/cn';
import type {SpectrumTextProps} from '../../primitives';

const ButtonTextClassContext = createContext<string | undefined>(undefined);

export function ButtonTextClassProvider({
  children,
  className
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <ButtonTextClassContext.Provider value={className}>{children}</ButtonTextClassContext.Provider>
  );
}

export const ButtonText = forwardRef<React.ElementRef<typeof NativeText>, SpectrumTextProps>(
  function ButtonText(props, ref) {
    let contextClassName = useContext(ButtonTextClassContext);
    let {className, ...otherProps} = props;

    return <NativeText {...otherProps} className={cn(contextClassName, className)} ref={ref} />;
  }
);
