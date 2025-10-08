'use client';
import {Button as RACButton, ButtonProps, composeRenderProps} from 'react-aria-components';
import {ProgressCircle} from './ProgressCircle';
import './Button.css';

export function Button(props: ButtonProps) {
  return (
    <RACButton {...props}>
      {composeRenderProps(props.children, (children, {isPending}) => (
        <>
          {!isPending && children}
          {isPending && (
            <ProgressCircle aria-label="Saving..." isIndeterminate />
          )}
        </>
      ))}
    </RACButton>
  );
}
