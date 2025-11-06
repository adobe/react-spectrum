'use client';
import React from "react";
import {composeRenderProps, DropZoneProps, DropZone as RACDropZone} from 'react-aria-components';
import { tv } from "tailwind-variants";

const dropZone = tv({
  base: "flex items-center justify-center p-8 min-h-24 w-[30%] font-sans text-base text-balance text-center rounded-lg border border-1 border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900",
  variants: {
    isFocusVisible: {
      true: "outline outline-2 -outline-offset-1 outline-blue-600 dark:outline-blue-500 forced-colors:outline-[Highlight]"
    },
    isDropTarget: {
      true: "bg-blue-200 dark:bg-blue-800 outline outline-2 -outline-offset-1 outline-blue-600 dark:outline-blue-500 forced-colors:outline-[Highlight]",
    }
  }
});

export function DropZone(props: DropZoneProps) {
  return (
    <RACDropZone
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) => dropZone({ ...renderProps, className }))} />
  );
}
