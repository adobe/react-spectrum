import React, { ReactNode } from 'react';
import { composeRenderProps, ToggleButtonGroup as RACToggleButtonGroup, ToggleButtonGroupProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';

const styles = tv({
  base: 'flex gap-1',
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col'
    }
  }
});

export function ToggleButtonGroup(props: ToggleButtonGroupProps): ReactNode {
  return (
    <RACToggleButtonGroup
      {...props}
      className={composeRenderProps(props.className, (className) => styles({orientation: props.orientation || 'horizontal', className}))} />
  );
}
