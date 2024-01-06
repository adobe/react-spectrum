import {Toolbar as RACToolbar, ToolbarProps, composeRenderProps} from 'react-aria-components';
import {tv} from 'tailwind-variants';
import React from 'react';

const styles = tv({
  base: 'flex gap-2',
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col items-start'
    }
  }
})

export function Toolbar(props: ToolbarProps) {
  return (
    <RACToolbar
      {...props}
      className={composeRenderProps(
        props.className,
        (className, renderProps) => styles({...renderProps, className})
      )} />
  );
}
