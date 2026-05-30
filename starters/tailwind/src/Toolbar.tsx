'use client';
import React from 'react';
import {Toolbar as RACToolbar, type ToolbarProps} from 'react-aria-components/Toolbar';
import {ToggleButtonGroupContext} from 'react-aria-components/ToggleButtonGroup';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import {tv} from 'tailwind-variants';

const styles = tv({
  base: 'flex flex-wrap gap-2',
  variants: {
    orientation: {
      horizontal: 'flex-row items-center',
      vertical: 'flex-col items-start'
    }
  }
});

export function Toolbar(props: ToolbarProps) {
  return (
    <ToggleButtonGroupContext.Provider value={{orientation: props.orientation}}>
      <RACToolbar
        {...props}
        className={composeRenderProps(props.className, (className, renderProps) =>
          styles({...renderProps, className})
        )}
      />
    </ToggleButtonGroupContext.Provider>
  );
}
