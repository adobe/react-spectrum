'use client';
import {Button as RACButton, ButtonProps as RACButtonProps, composeRenderProps} from 'react-aria-components';
import {ProgressCircle} from './ProgressCircle';
import './Button.css';

interface ButtonProps extends RACButtonProps {
  /**
   * The visual style of the button (Vanilla CSS implementation specific).
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'quiet'
}

export function Button(props: ButtonProps) {
  return (
    <RACButton {...props} className="react-aria-Button button-base" data-variant={props.variant || 'primary'}>
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
