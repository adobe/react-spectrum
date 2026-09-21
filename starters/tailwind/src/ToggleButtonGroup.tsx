'use client';
import React from 'react';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import {
  ToggleButtonGroup as RACToggleButtonGroup,
  type ToggleButtonGroupProps
} from 'react-aria-components/ToggleButtonGroup';
import {tv} from 'tailwind-variants';

const styles = tv({
  base: 'flex gap-1',
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col'
    }
  }
});

export function ToggleButtonGroup(props: ToggleButtonGroupProps) {
  return (
    <RACToggleButtonGroup
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) =>
        styles({...renderProps, className})
      )}
    />
  );
}
